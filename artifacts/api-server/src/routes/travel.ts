import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { BookingRequest, ContactRequest, FlightSearchRequest, NewsletterRequest, PartnerApplication, ServiceRequest, TripLookupRequest } from "@workspace/api-zod";
import { config } from "../lib/config";
import { getDuffelOfferData, searchDuffelFlights, createDuffelOrder } from "../lib/duffel";
import { createBooking, createPartnerApplication, createServiceRequest, findBookings, saveContact, subscribe } from "../lib/store";
import { notifyTeam } from "../lib/notifications";

const router: IRouter = Router();

router.post("/flights/search", async (req, res, next) => {
  try {
    const search = FlightSearchRequest.parse(req.body);
    
    // Check if Duffel is configured
    if (!config.duffelToken) {
      console.error("DUFFEL_API_TOKEN not configured");
      return res.status(503).json({ 
        error: "Flight search service not configured. Please contact support.",
        code: "DUFFEL_NOT_CONFIGURED",
        searchId: `demo-${randomUUID()}`,
        source: "error",
        offers: []
      });
    }
    
    try {
      const live = await searchDuffelFlights(search);
      if (live && live.offers.length > 0) {
        return res.json({ searchId: live.searchId, source: "duffel", search, offers: live.offers });
      }
      
      // No offers found
      return res.json({ 
        searchId: `demo-${randomUUID()}`, 
        source: "duffel", 
        search, 
        offers: [],
        message: "No flights found for this route and date. Try different dates or airports."
      });
    } catch (duffelError) {
      console.error("Duffel API error:", duffelError);
      return res.status(503).json({
        error: duffelError instanceof Error ? duffelError.message : "Flight search failed",
        code: "DUFFEL_API_ERROR",
        searchId: `demo-${randomUUID()}`,
        source: "error",
        offers: []
      });
    }
  } catch (error) { next(error); }
});

router.get("/flights/offers/:offerId", async (req, res, next) => {
  try {
    if (!config.duffelEnabled) return res.status(503).json({ error: "Duffel is not configured", code: "DUFFEL_NOT_CONFIGURED" });
    const offer = await getDuffelOfferData(req.params.offerId, String(req.query.cabin || "Economy"));
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    return res.json({ source: "duffel", offer });
  } catch (error) { next(error); }
});

router.post("/bookings", async (req, res, next) => {
  try {
    const input = BookingRequest.parse(req.body);
    
    let booking;
    
    if (config.duffelEnabled) {
      try {
        // Create real Duffel order
        const order = await createDuffelOrder(input.offerId, input);
        
        // Store booking with Duffel order data
        booking = await createBooking(input, {
          orderId: order.orderId,
          bookingReference: order.bookingReference,
          paymentStatus: order.paymentStatus,
        });
        
        void notifyTeam({
          subject: `Flight booking confirmed ${booking.id}`,
          text: `${input.firstName} ${input.lastName} booked ${input.search.from} to ${input.search.to} on ${input.search.departDate}.\nBooking Reference: ${order.bookingReference}\nDuffel Order ID: ${order.orderId}\nPayment Status: ${order.paymentStatus}\nEmail: ${input.email}\nPhone: ${input.phone}`,
          replyTo: input.email,
        });
        
        return res.status(201).json({
          id: booking.id,
          status: booking.status,
          bookingReference: order.bookingReference,
          duffelOrderId: order.orderId,
          paymentStatus: order.paymentStatus,
          provider: "duffel",
          message: "Flight booked successfully",
        });
      } catch (duffelError) {
        // Handle Duffel API errors
        console.error("Duffel order creation failed:", duffelError);
        
        // Create booking with failed status
        booking = await createBooking(input);
        
        void notifyTeam({
          subject: `Flight booking failed ${booking.id}`,
          text: `${input.firstName} ${input.lastName} attempted booking ${input.search.from} to ${input.search.to}.\nError: ${duffelError instanceof Error ? duffelError.message : "Unknown error"}\nEmail: ${input.email}\nPhone: ${input.phone}\nOffer: ${input.offerId}`,
          replyTo: input.email,
        });
        
        return res.status(400).json({
          id: booking.id,
          status: "failed",
          provider: "duffel",
          error: duffelError instanceof Error ? duffelError.message : "Order creation failed",
          message: "Booking failed. Please try again or contact support.",
        });
      }
    } else {
      // Demo mode: create booking request without real order
      booking = await createBooking(input);
      
      void notifyTeam({
        subject: `New flight booking request ${booking.id}`,
        text: `${input.firstName} ${input.lastName} requested ${input.search.from} to ${input.search.to} on ${input.search.departDate}.\nEmail: ${input.email}\nPhone: ${input.phone}\nOffer: ${input.offerId}`,
        replyTo: input.email,
      });
      
      return res.status(201).json({
        id: booking.id,
        status: booking.status,
        provider: "demo",
        message: "Booking request received. Live order creation is ready to be enabled.",
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/contact", async (req, res, next) => {
  try {
    const input = ContactRequest.parse(req.body);
    await saveContact(input);
    void notifyTeam({ subject: `Website contact: ${input.subject}`, text: `${input.name} (${input.email}) wrote:\n\n${input.message}`, replyTo: input.email });
    return res.status(201).json({ status: "received" });
  } catch (error) { next(error); }
});

router.post("/newsletter/subscribe", async (req, res, next) => {
  try { const input = NewsletterRequest.parse(req.body); await subscribe(input.email); return res.status(201).json({ status: "subscribed" }); } catch (error) { next(error); }
});

router.post("/trips/lookup", async (req, res, next) => {
  try { const input = TripLookupRequest.parse(req.body); return res.json({ trips: await findBookings(input.reference, input.email) }); } catch (error) { next(error); }
});

router.post("/service-requests", async (req, res, next) => {
  try {
    const input = ServiceRequest.parse(req.body);
    const request = await createServiceRequest(input);
    void notifyTeam({ subject: `New service request ${request.id}: ${input.item}`, text: `${input.name} requested ${input.item} (${input.service}).\nEmail: ${input.email}\nPhone: ${input.phone}\nDetails: ${input.details}`, replyTo: input.email });
    return res.status(201).json({ id: request.id, status: request.status });
  } catch (error) { next(error); }
});

router.post("/partner-applications", async (req, res, next) => {
  try {
    const input = PartnerApplication.parse(req.body);
    const application = await createPartnerApplication(input);
    void notifyTeam({ subject: `New partner application ${application.id}: ${input.business}`, text: `${input.business} (${input.type}) in ${input.location}.\nEmail: ${input.email}\nDetails: ${input.details}`, replyTo: input.email });
    return res.status(201).json({ id: application.id, status: application.status });
  } catch (error) { next(error); }
});

export default router;