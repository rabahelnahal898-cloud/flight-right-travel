import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { BookingRequest, ContactRequest, FlightSearchRequest, NewsletterRequest, PartnerApplication, ServiceRequest, TripLookupRequest } from "@workspace/api-zod";
import { config } from "../lib/config";
import { searchDuffelFlights } from "../lib/duffel";
import { createBooking, createPartnerApplication, createServiceRequest, findBookings, saveContact, subscribe } from "../lib/store";
import { notifyTeam } from "../lib/notifications";

const router: IRouter = Router();

router.post("/flights/search", async (req, res, next) => {
  try {
    const search = FlightSearchRequest.parse(req.body);
    const live = await searchDuffelFlights(search);
    if (live) return res.json({ searchId: live.searchId, source: "duffel", search, offers: live.offers });
    return res.json({ searchId: `demo-${randomUUID()}`, source: "demo", search, offers: [] });
  } catch (error) { next(error); }
});

router.get("/flights/offers/:offerId", async (req, res, next) => {
  try {
    if (!config.duffelEnabled) return res.status(503).json({ error: "Duffel is not configured", code: "DUFFEL_NOT_CONFIGURED" });
    const offer = await (await import("../lib/duffel")).getDuffelOffer(req.params.offerId);
    if (!offer) return res.status(404).json({ error: "Offer not found" });
    return res.json({ source: "duffel", offer });
  } catch (error) { next(error); }
});

router.post("/bookings", (req, res, next) => {
  try {
    const input = BookingRequest.parse(req.body);
    const booking = createBooking(input);
    void notifyTeam({
      subject: `New flight booking request ${booking.id}`,
      text: `${input.firstName} ${input.lastName} requested ${input.search.from} to ${input.search.to} on ${input.search.departDate}.\nEmail: ${input.email}\nPhone: ${input.phone}\nOffer: ${input.offerId}`,
      replyTo: input.email,
    });
    return res.status(201).json({ id: booking.id, status: booking.status, provider: config.duffelEnabled ? "duffel" : "demo", message: "Booking request received. Live order creation is ready to be enabled." });
  } catch (error) { next(error); }
});

router.post("/contact", (req, res, next) => {
  try {
    const input = ContactRequest.parse(req.body);
    saveContact(input);
    void notifyTeam({ subject: `Website contact: ${input.subject}`, text: `${input.name} (${input.email}) wrote:\n\n${input.message}`, replyTo: input.email });
    return res.status(201).json({ status: "received" });
  } catch (error) { next(error); }
});

router.post("/newsletter/subscribe", (req, res, next) => {
  try { const input = NewsletterRequest.parse(req.body); subscribe(input.email); return res.status(201).json({ status: "subscribed" }); } catch (error) { next(error); }
});

router.post("/trips/lookup", (req, res, next) => {
  try { const input = TripLookupRequest.parse(req.body); return res.json({ trips: findBookings(input.reference, input.email) }); } catch (error) { next(error); }
});

router.post("/service-requests", (req, res, next) => {
  try {
    const input = ServiceRequest.parse(req.body);
    const request = createServiceRequest(input);
    void notifyTeam({ subject: `New service request ${request.id}: ${input.item}`, text: `${input.name} requested ${input.item} (${input.service}).\nEmail: ${input.email}\nPhone: ${input.phone}\nDetails: ${input.details}`, replyTo: input.email });
    return res.status(201).json({ id: request.id, status: request.status });
  } catch (error) { next(error); }
});

router.post("/partner-applications", (req, res, next) => {
  try {
    const input = PartnerApplication.parse(req.body);
    const application = createPartnerApplication(input);
    void notifyTeam({ subject: `New partner application ${application.id}: ${input.business}`, text: `${input.business} (${input.type}) in ${input.location}.\nEmail: ${input.email}\nDetails: ${input.details}`, replyTo: input.email });
    return res.status(201).json({ id: application.id, status: application.status });
  } catch (error) { next(error); }
});

export default router;