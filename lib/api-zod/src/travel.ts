import { z } from "zod";

export const FlightSearchRequest = z.object({
  from: z.string().trim().min(2).max(120),
  to: z.string().trim().min(2).max(120),
  departDate: z.string().date(),
  returnDate: z.string().date().optional(),
  passengers: z.number().int().min(1).max(9),
  cabin: z.enum(["Economy", "Premium Economy", "Business", "First"]),
});

export const FlightOffer = z.object({
  id: z.string(),
  airline: z.string(),
  flightNumber: z.string(),
  departTime: z.string(),
  arriveTime: z.string(),
  duration: z.string(),
  stops: z.string(),
  price: z.string(),
  currency: z.string(),
  cabin: z.string(),
});

export const FlightSearchResponse = z.object({
  searchId: z.string(),
  source: z.enum(["duffel", "demo"]),
  search: FlightSearchRequest,
  offers: z.array(FlightOffer),
});

export const BookingRequest = z.object({
  offerId: z.string().min(1),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().email(),
  phone: z.string().trim().min(6).max(40),
  search: FlightSearchRequest,
});

export const BookingResponse = z.object({
  id: z.string(),
  status: z.enum(["request_received", "confirmed", "failed"]),
  provider: z.enum(["duffel", "demo"]),
  message: z.string(),
});

export const ContactRequest = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  subject: z.string().trim().min(1).max(160),
  message: z.string().trim().min(1).max(4000),
});

export const NewsletterRequest = z.object({
  email: z.string().email(),
});

export const TripLookupRequest = z.object({
  reference: z.string().trim().min(3).max(80),
  email: z.string().email(),
});

export const ServiceRequest = z.object({
  service: z.string().trim().min(1).max(80),
  item: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  phone: z.string().trim().min(6).max(40),
  details: z.string().trim().min(1).max(4000),
});

export const PartnerApplication = z.object({
  business: z.string().trim().min(1).max(160),
  email: z.string().email(),
  type: z.string().trim().min(1).max(80),
  location: z.string().trim().min(1).max(160),
  details: z.string().trim().min(1).max(4000),
});

export const PaymentCheckoutRequest = z.object({
  bookingId: z.string().trim().min(3).max(80),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const PaymentCheckoutResponse = z.object({
  sessionId: z.string(),
  checkoutUrl: z.string().url(),
  provider: z.literal("stripe"),
});

export type FlightSearchInput = z.infer<typeof FlightSearchRequest>;
export type FlightOfferData = z.infer<typeof FlightOffer>;
export type BookingInput = z.infer<typeof BookingRequest>;
export type PaymentCheckoutInput = z.infer<typeof PaymentCheckoutRequest>;
export type ServiceRequestInput = z.infer<typeof ServiceRequest>;
export type PartnerApplicationInput = z.infer<typeof PartnerApplication>;