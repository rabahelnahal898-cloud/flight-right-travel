import type { FlightOfferData, FlightSearchInput } from "@workspace/api-zod";
import { config } from "./config";

type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  owner?: { name?: string; iata_code?: string };
  slices?: Array<{ duration?: string; segments?: Array<{ departing_at: string; arriving_at: string; marketing_carrier?: { iata_code?: string }; marketing_carrier_flight_number?: string }> }>;
};

function formatOffer(offer: DuffelOffer, cabin: string): FlightOfferData {
  const slice = offer.slices?.[0];
  const first = slice?.segments?.[0];
  const last = slice?.segments?.at(-1) || first;
  return {
    id: offer.id,
    airline: offer.owner?.name || offer.owner?.iata_code || "Airline",
    flightNumber: `${first?.marketing_carrier?.iata_code || ""} ${first?.marketing_carrier_flight_number || ""}`.trim(),
    departTime: first ? new Date(first.departing_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
    arriveTime: last ? new Date(last.arriving_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-",
    duration: slice?.duration || "-",
    stops: `${Math.max(0, (slice?.segments?.length || 1) - 1)} stop${(slice?.segments?.length || 1) === 2 ? "" : "s"}`,
    price: offer.total_amount,
    currency: offer.total_currency,
    cabin,
  };
}

export async function searchDuffelFlights(input: FlightSearchInput) {
  if (!config.duffelToken) return null;

  const passengers = Array.from({ length: input.passengers }, () => ({ type: "adult" }));
  const slices = [{ origin: input.from, destination: input.to, departure_date: input.departDate }];
  if (input.returnDate) slices.push({ origin: input.to, destination: input.from, departure_date: input.returnDate });
  const response = await fetch(`${config.duffelApiUrl}/air/offer_requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.duffelToken}`, "Content-Type": "application/json", "Duffel-Version": "v2" },
    body: JSON.stringify({ data: { slices, passengers, cabin_class: input.cabin.toLowerCase().replace(" ", "_") } }),
  });
  if (!response.ok) throw new Error(`Duffel offer request failed with ${response.status}`);
  const payload = await response.json() as { data?: { id?: string; offers?: DuffelOffer[] } };
  return { searchId: payload.data?.id || "duffel-search", offers: (payload.data?.offers || []).map((offer) => formatOffer(offer, input.cabin)) };
}

export async function getDuffelOffer(offerId: string) {
  if (!config.duffelToken) return null;
  const response = await fetch(`${config.duffelApiUrl}/air/offers/${encodeURIComponent(offerId)}`, {
    headers: { Authorization: `Bearer ${config.duffelToken}`, "Duffel-Version": "v2" },
  });
  if (!response.ok) throw new Error(`Duffel offer lookup failed with ${response.status}`);
  const payload = await response.json() as { data?: DuffelOffer };
  return payload.data || null;
}