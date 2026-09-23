#!/usr/bin/env node

/**
 * Test script to verify Duffel API is working
 * 
 * Usage: 
 *   - Set DUFFEL_API_TOKEN in your environment or .env file
 *   - Run: node test-duffel-api.mjs
 * 
 * Or pass token directly:
 *   DUFFEL_API_TOKEN=your_token_here node test-duffel-api.mjs
 */

const DUFFEL_TOKEN = process.env.DUFFEL_API_TOKEN || "YOUR_TOKEN_HERE"; // Get from .env file
const DUFFEL_API_URL = "https://api.duffel.com";

async function testDuffelSearch() {
  console.log("🧪 Testing Duffel API...\n");
  
  const searchRequest = {
    data: {
      slices: [
        {
          origin: "AMS", // Amsterdam
          destination: "CAI", // Cairo
          departure_date: "2026-10-15" // Must be future date
        }
      ],
      passengers: [{ type: "adult" }],
      cabin_class: "economy",
      return_offers: true
    }
  };

  try {
    console.log("📡 Sending request to Duffel API...");
    console.log(`Route: Amsterdam (AMS) → Cairo (CAI)`);
    console.log(`Date: 2026-10-15\n`);

    const response = await fetch(`${DUFFEL_API_URL}/air/offer_requests`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DUFFEL_TOKEN}`,
        "Content-Type": "application/json",
        "Duffel-Version": "v2"
      },
      body: JSON.stringify(searchRequest)
    });

    console.log(`Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:");
      console.error(errorText);
      return;
    }

    const result = await response.json();
    
    if (result.data && result.data.offers) {
      const offers = result.data.offers;
      console.log(`✅ SUCCESS! Found ${offers.length} flight offers:\n`);
      
      offers.slice(0, 5).forEach((offer, index) => {
        const slice = offer.slices?.[0];
        const segment = slice?.segments?.[0];
        const lastSegment = slice?.segments?.[slice.segments.length - 1] || segment;
        
        console.log(`${index + 1}. ${offer.owner?.name || offer.owner?.iata_code || "Unknown"}`);
        console.log(`   Price: ${offer.total_currency} ${offer.total_amount}`);
        console.log(`   Flight: ${segment?.marketing_carrier?.iata_code} ${segment?.marketing_carrier_flight_number}`);
        console.log(`   Departure: ${new Date(segment?.departing_at).toLocaleString()}`);
        console.log(`   Arrival: ${new Date(lastSegment?.arriving_at).toLocaleString()}`);
        console.log(`   Stops: ${(slice?.segments?.length || 1) - 1}`);
        console.log(`   Offer ID: ${offer.id}`);
        console.log("");
      });

      if (offers.length > 5) {
        console.log(`... and ${offers.length - 5} more offers\n`);
      }

      console.log("✅ Duffel API is working correctly!");
      console.log("\n📋 Next steps:");
      console.log("1. Set DUFFEL_API_TOKEN in Vercel environment variables");
      console.log("2. Set DATABASE_URL in Vercel environment variables");
      console.log("3. Redeploy your site from Vercel dashboard");
      console.log("4. Your live site will show real flight data!");
      
    } else {
      console.log("⚠️  No offers returned");
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error.message);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

testDuffelSearch();
