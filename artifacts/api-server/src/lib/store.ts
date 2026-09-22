import { randomUUID } from "node:crypto";
import type { BookingInput, PartnerApplicationInput, ServiceRequestInput } from "@workspace/api-zod";

export type BookingRecord = BookingInput & {
  id: string;
  createdAt: string;
  status: "request_received" | "confirmed" | "failed";
  duffelOrderId?: string;
  bookingReference?: string;
  paymentStatus?: string;
};

const bookings = new Map<string, BookingRecord>();
const contacts: Array<Record<string, string>> = [];
const subscribers = new Set<string>();
const serviceRequests: Array<ServiceRequestInput & { id: string; createdAt: string; status: "received" }> = [];
const partnerApplications: Array<PartnerApplicationInput & { id: string; createdAt: string; status: "received" }> = [];

export function createBooking(
  input: BookingInput,
  duffelData?: { orderId: string; bookingReference: string; paymentStatus: string }
): BookingRecord {
  const record: BookingRecord = {
    ...input,
    id: `FR-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: duffelData ? "confirmed" : "request_received",
    duffelOrderId: duffelData?.orderId,
    bookingReference: duffelData?.bookingReference,
    paymentStatus: duffelData?.paymentStatus,
  };
  bookings.set(record.id, record);
  return record;
}

export function findBookings(reference: string, email: string) {
  return [...bookings.values()].filter(
    (booking) => booking.id.toLowerCase() === reference.toLowerCase() && booking.email.toLowerCase() === email.toLowerCase(),
  );
}

export function saveContact(input: Record<string, string>) {
  contacts.push({ ...input, createdAt: new Date().toISOString() });
}

export function subscribe(email: string) {
  subscribers.add(email.toLowerCase());
}

export function getBooking(id: string) {
  return bookings.get(id);
}

export function createServiceRequest(input: ServiceRequestInput) {
  const record = { ...input, id: `SR-${randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), status: "received" as const };
  serviceRequests.push(record);
  return record;
}

export function createPartnerApplication(input: PartnerApplicationInput) {
  const record = { ...input, id: `PA-${randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString(), status: "received" as const };
  partnerApplications.push(record);
  return record;
}