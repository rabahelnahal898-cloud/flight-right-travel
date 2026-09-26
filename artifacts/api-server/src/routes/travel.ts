import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { ContactRequest, FlightSearchRequest, NewsletterRequest, PartnerApplication, ServiceRequest, TripLookupRequest } from "@workspace/api-zod";
import { config } from "../lib/config";
import { getDuffelOfferData, searchDuffelFlights } from "../lib/duffel";
import { createPartnerApplication, createServiceRequest, findBookings, saveContact, subscribe } from "../lib/store";
import { notifyTeam } from "../lib/notifications";

const router: IRouter = Router();

// Health check endpoint to verify configuration
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    config: {
      duffelConfigured: config.duffelEnabled,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      duffelApiUrl: config.duffelApiUrl,
    }
  });
});

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

router.post("/bookings", (_req, res) =>
  res.status(410).json({
    error: "Flight bookings must start through secure checkout",
    code: "CHECKOUT_REQUIRED",
  }),
);

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