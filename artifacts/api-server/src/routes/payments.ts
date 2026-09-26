import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { BookingRequest, PaymentCheckoutRequest } from "@workspace/api-zod";
import { config } from "../lib/config";
import { createDuffelOrder, getDuffelOffer } from "../lib/duffel";
import {
  claimBookingForFulfillment,
  confirmBooking,
  createPendingBooking,
  deletePendingBooking,
  failBooking,
  getBooking,
} from "../lib/store";
import { notifyTeam } from "../lib/notifications";

const router: IRouter = Router();

function stripeClient() {
  return config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;
}

router.post("/checkout", async (req, res, next) => {
  let bookingId: string | undefined;
  try {
    const stripe = stripeClient();
    if (!stripe) return res.status(503).json({ error: "Stripe is not configured", code: "STRIPE_NOT_CONFIGURED" });
    if (!config.duffelEnabled) return res.status(503).json({ error: "Flight booking is not configured", code: "DUFFEL_NOT_CONFIGURED" });

    const input = PaymentCheckoutRequest.parse(req.body);
    const origin = req.get("origin");
    const successUrl = new URL(input.successUrl);
    const cancelUrl = new URL(input.cancelUrl);
    if (!origin || successUrl.origin !== origin || cancelUrl.origin !== origin) {
      return res.status(400).json({ error: "Checkout return URLs must match the website origin", code: "INVALID_RETURN_URL" });
    }

    if (input.passengers.length !== input.search.passengers) {
      return res.status(400).json({ error: "Enter details for every traveller", code: "PASSENGER_COUNT_MISMATCH" });
    }

    const offer = await getDuffelOffer(input.offerId);
    if (!offer) return res.status(404).json({ error: "Flight offer is no longer available", code: "OFFER_NOT_FOUND" });
    if (!offer.passengers || offer.passengers.length !== input.passengers.length || offer.passengers.some((passenger) => !passenger.id)) {
      return res.status(409).json({ error: "The offer no longer matches the selected travellers. Search again.", code: "OFFER_PASSENGERS_CHANGED" });
    }

    const liveAmount = Number(offer.total_amount);
    const expectedAmount = Number(input.amount);
    const amountInMinorUnits = Math.round(liveAmount * 100);
    if (!Number.isFinite(liveAmount) || amountInMinorUnits <= 0) {
      return res.status(502).json({ error: "Unable to verify offer price for checkout", code: "OFFER_PRICE_UNAVAILABLE" });
    }
    if (
      !Number.isFinite(expectedAmount) ||
      Math.round(expectedAmount * 100) !== amountInMinorUnits ||
      input.currency.toUpperCase() !== offer.total_currency.toUpperCase()
    ) {
      return res.status(409).json({
        error: "The fare changed. Review the updated price before continuing.",
        code: "OFFER_PRICE_CHANGED",
        amount: offer.total_amount,
        currency: offer.total_currency,
      });
    }

    const { successUrl: _successUrl, cancelUrl: _cancelUrl, ...submittedBooking } = input;
    const booking = await createPendingBooking({
      ...submittedBooking,
      amount: offer.total_amount,
      currency: offer.total_currency,
    });
    bookingId = booking.id;

    const successUrlWithSession = `${successUrl.toString()}${successUrl.search ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: successUrlWithSession,
      cancel_url: cancelUrl.toString(),
      client_reference_id: booking.id,
      metadata: { bookingId: booking.id, offerId: booking.offerId },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: offer.total_currency.toLowerCase(),
          unit_amount: amountInMinorUnits,
          product_data: { name: `Flight Right flight booking`, description: `${booking.search.from} to ${booking.search.to} · ${booking.passengers.length} traveller(s)` },
        },
      }],
    }, { idempotencyKey: `flight-checkout-${booking.id}` });

    if (!session.url) {
      await deletePendingBooking(booking.id);
      return res.status(502).json({ error: "Stripe did not return a checkout URL", code: "STRIPE_CHECKOUT_URL_MISSING" });
    }
    return res.status(201).json({ sessionId: session.id, checkoutUrl: session.url, amount: offer.total_amount, currency: offer.total_currency, provider: "stripe" });
  } catch (error) {
    if (bookingId) await deletePendingBooking(bookingId).catch(() => undefined);
    next(error);
  }
});

async function refundPaidCheckout(stripe: Stripe, session: Stripe.Checkout.Session, bookingId: string) {
  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;
  if (!paymentIntentId) throw new Error(`Paid checkout ${session.id} has no payment intent`);

  await stripe.refunds.create(
    { payment_intent: paymentIntentId },
    { idempotencyKey: `flight-refund-${session.id}` },
  );
  await failBooking(bookingId, "refunded");
}

async function fulfillPaidCheckout(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) throw new Error(`Paid checkout ${session.id} is missing booking metadata`);

  const booking = await getBooking(bookingId);
  if (!booking) throw new Error(`Paid checkout ${session.id} has no pending booking`);
  if (booking.status === "confirmed") return;

  if (booking.status === "failed" && booking.paymentStatus === "refund_failed") {
    await refundPaidCheckout(stripe, session, bookingId);
    return;
  }
  if (booking.status !== "pending_payment") return;

  if (!(await claimBookingForFulfillment(bookingId))) return;

  let order: Awaited<ReturnType<typeof createDuffelOrder>>;
  try {
    const bookingInput = BookingRequest.parse(booking);
    order = await createDuffelOrder(bookingInput.offerId, bookingInput);
    if (order.paymentStatus !== "paid") {
      throw new Error("The airline order was not paid from the agency balance");
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Duffel order error";
    await failBooking(bookingId, "refund_pending");
    try {
      await refundPaidCheckout(stripe, session, bookingId);
    } catch (refundError) {
      await failBooking(bookingId, "refund_failed");
      void notifyTeam({
        subject: `Urgent: payment refund failed for booking ${bookingId}`,
        text: `The customer's Stripe payment was captured, but the airline order failed and the automatic refund also failed. Booking ${bookingId}. Provider error: ${reason}. Refund error: ${refundError instanceof Error ? refundError.message : "Unknown refund error"}.`,
      });
      throw refundError;
    }
    void notifyTeam({
      subject: `Flight booking failed and payment refunded ${bookingId}`,
      text: `The customer's Stripe payment was refunded because the airline order could not be completed. Booking ${bookingId}. Route: ${booking.search.from} to ${booking.search.to}. Provider error: ${reason}.`,
      replyTo: booking.email,
    });
    return;
  }

  await confirmBooking(bookingId, {
    orderId: order.orderId,
    bookingReference: order.bookingReference,
    paymentStatus: order.paymentStatus,
  });
  void notifyTeam({
    subject: `Paid flight booking confirmed ${bookingId}`,
    text: `${booking.firstName} ${booking.lastName} booked ${booking.search.from} to ${booking.search.to} on ${booking.search.departDate}.\nBooking Reference: ${order.bookingReference}\nDuffel Order ID: ${order.orderId}\nPayment Status: ${order.paymentStatus}\nEmail: ${booking.email}\nPhone: ${booking.phone}`,
    replyTo: booking.email,
  });
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = stripeClient();
  if (!stripe || !config.stripeWebhookSecret) return res.status(503).json({ error: "Stripe webhook is not configured", code: "STRIPE_WEBHOOK_NOT_CONFIGURED" });
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string" || !Buffer.isBuffer(req.body)) return res.status(400).json({ error: "Missing Stripe signature or raw body" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, config.stripeWebhookSecret);
  } catch {
    return res.status(400).json({ error: "Invalid Stripe webhook signature", code: "STRIPE_WEBHOOK_INVALID" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await fulfillPaidCheckout(stripe, event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) await deletePendingBooking(bookingId);
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", {
      eventId: event.id,
      bookingId: (event.data.object as Stripe.Checkout.Session).metadata?.bookingId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return res.status(500).json({ error: "Webhook processing failed", code: "WEBHOOK_PROCESSING_FAILED" });
  }
}

export default router;