import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { PaymentCheckoutRequest } from "@workspace/api-zod";
import { config } from "../lib/config";
import { getDuffelOffer } from "../lib/duffel";
import { getBooking } from "../lib/store";

const router: IRouter = Router();

function stripeClient() {
  return config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;
}

router.post("/checkout", async (req, res, next) => {
  try {
    const stripe = stripeClient();
    if (!stripe) return res.status(503).json({ error: "Stripe is not configured", code: "STRIPE_NOT_CONFIGURED" });
    const input = PaymentCheckoutRequest.parse(req.body);
    const booking = getBooking(input.bookingId);
    if (!booking) return res.status(404).json({ error: "Booking request not found", code: "BOOKING_NOT_FOUND" });
    if (!config.duffelEnabled) return res.status(503).json({ error: "Duffel is required to price this payment", code: "DUFFEL_NOT_CONFIGURED" });
    const offer = await getDuffelOffer(booking.offerId);
    const amount = offer ? Math.round(Number(offer.total_amount) * 100) : 0;
    const currency = offer?.total_currency?.toLowerCase();
    if (!amount || !currency) return res.status(502).json({ error: "Unable to verify live offer price", code: "OFFER_PRICE_UNAVAILABLE" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: booking.id,
      metadata: { bookingId: booking.id, offerId: booking.offerId },
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: { name: `Flight Right booking ${booking.id}`, description: `${booking.search.from} to ${booking.search.to}` },
        },
      }],
    });

    if (!session.url) return res.status(502).json({ error: "Stripe did not return a checkout URL", code: "STRIPE_CHECKOUT_URL_MISSING" });
    return res.status(201).json({ sessionId: session.id, checkoutUrl: session.url, provider: "stripe" });
  } catch (error) { next(error); }
});

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = stripeClient();
  if (!stripe || !config.stripeWebhookSecret) return res.status(503).json({ error: "Stripe webhook is not configured", code: "STRIPE_WEBHOOK_NOT_CONFIGURED" });
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string" || !Buffer.isBuffer(req.body)) return res.status(400).json({ error: "Missing Stripe signature or raw body" });

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, config.stripeWebhookSecret);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.info(`Stripe payment completed for booking ${session.metadata?.bookingId || "unknown"}`);
    }
    return res.json({ received: true });
  } catch {
    return res.status(400).json({ error: "Invalid Stripe webhook signature", code: "STRIPE_WEBHOOK_INVALID" });
  }
}

export default router;