import type { PrismaClient as PrismaClientType } from "@prisma/client";
import type { BookingInput, PartnerApplicationInput, ServiceRequestInput } from "@workspace/api-zod";

let prisma: PrismaClientType | null = null;

async function getPrismaClient(): Promise<PrismaClientType> {
  if (!process.env.DATABASE_URL) {
    throw new Error("Database is not configured.");
  }

  if (!prisma) {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
  }

  return prisma;
}

export type BookingRecord = BookingInput & {
  id: string;
  createdAt: string;
  status: "request_received" | "confirmed" | "failed";
  duffelOrderId?: string;
  bookingReference?: string;
  paymentStatus?: string;
};

export async function createBooking(
  input: BookingInput,
  duffelData?: { orderId: string; bookingReference: string; paymentStatus: string }
): Promise<BookingRecord> {
  const client = await getPrismaClient();
  const booking = await client.booking.create({
    data: {
      offerId: input.offerId,
      amount: input.amount,
      currency: input.currency,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      title: input.title,
      passengers: input.passengers || [],
      search: input.search,
      status: duffelData ? "confirmed" : "request_received",
      duffelOrderId: duffelData?.orderId,
      bookingReference: duffelData?.bookingReference,
      paymentStatus: duffelData?.paymentStatus,
    },
  });

  return {
    ...input,
    id: booking.id,
    createdAt: booking.createdAt.toISOString(),
    status: booking.status as "request_received" | "confirmed" | "failed",
    duffelOrderId: booking.duffelOrderId || undefined,
    bookingReference: booking.bookingReference || undefined,
    paymentStatus: booking.paymentStatus || undefined,
  };
}

export async function findBookings(reference: string, email: string) {
  const client = await getPrismaClient();
  const bookings = await client.booking.findMany({
    where: {
      OR: [
        { id: { equals: reference, mode: "insensitive" } },
        { bookingReference: { equals: reference, mode: "insensitive" } },
      ],
      email: { equals: email, mode: "insensitive" },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    createdAt: booking.createdAt.toISOString(),
    status: booking.status as "request_received" | "confirmed" | "failed",
    offerId: booking.offerId,
    amount: booking.amount,
    currency: booking.currency,
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    phone: booking.phone,
    dateOfBirth: booking.dateOfBirth,
    gender: booking.gender,
    title: booking.title,
    passengers: booking.passengers as any,
    search: booking.search as any,
    duffelOrderId: booking.duffelOrderId || undefined,
    bookingReference: booking.bookingReference || undefined,
    paymentStatus: booking.paymentStatus || undefined,
  }));
}

export async function saveContact(input: Record<string, string>) {
  const client = await getPrismaClient();
  await client.contact.create({
    data: {
      name: input.name || "",
      email: input.email || "",
      subject: input.subject || "",
      message: input.message || "",
    },
  });
}

export async function subscribe(email: string) {
  const client = await getPrismaClient();
  await client.subscriber.upsert({
    where: { email: email.toLowerCase() },
    update: {},
    create: { email: email.toLowerCase() },
  });
}

export async function getBooking(id: string) {
  const client = await getPrismaClient();
  const booking = await client.booking.findUnique({
    where: { id },
  });

  if (!booking) return null;

  return {
    id: booking.id,
    createdAt: booking.createdAt.toISOString(),
    status: booking.status as "request_received" | "confirmed" | "failed",
    offerId: booking.offerId,
    amount: booking.amount,
    currency: booking.currency,
    firstName: booking.firstName,
    lastName: booking.lastName,
    email: booking.email,
    phone: booking.phone,
    dateOfBirth: booking.dateOfBirth,
    gender: booking.gender,
    title: booking.title,
    passengers: booking.passengers as any,
    search: booking.search as any,
    duffelOrderId: booking.duffelOrderId || undefined,
    bookingReference: booking.bookingReference || undefined,
    paymentStatus: booking.paymentStatus || undefined,
  };
}

export async function createServiceRequest(input: ServiceRequestInput) {
  const client = await getPrismaClient();
  const request = await client.serviceRequest.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      service: input.service,
      item: input.item,
      details: input.details,
      status: "received",
    },
  });

  return {
    ...input,
    id: request.id,
    createdAt: request.createdAt.toISOString(),
    status: "received" as const,
  };
}

export async function createPartnerApplication(input: PartnerApplicationInput) {
  const client = await getPrismaClient();
  const application = await client.partnerApplication.create({
    data: {
      business: input.business,
      email: input.email,
      type: input.type,
      location: input.location,
      details: input.details,
      status: "received",
    },
  });

  return {
    ...input,
    id: application.id,
    createdAt: application.createdAt.toISOString(),
    status: "received" as const,
  };
}

// Export prisma instance for direct use if needed
export { prisma };