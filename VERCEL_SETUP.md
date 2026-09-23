# Vercel Environment Variables Setup

## ⚠️ CRITICAL: Your site is NOT using environment variables!

Your website **https://www.flightrighttravel.international/** is showing mock data because the Duffel API token is **NOT SET** in Vercel.

## Why This Matters

- The `.env` file in your local project **DOES NOT** get deployed to Vercel
- Environment variables must be set manually in the Vercel dashboard
- Without these variables, the API returns empty results and shows mock data

## Step-by-Step Fix

### 1. Go to Your Vercel Dashboard
Visit: https://vercel.com/dashboard

### 2. Select Your Project
Click on: **flight-right-travel** (or whatever your project is named)

### 3. Go to Settings
- Click **Settings** in the top menu
- Click **Environment Variables** in the left sidebar

### 4. Add These Environment Variables

Add each of these by clicking "Add New":

#### Required for Duffel Flight Search:
```
Name: DUFFEL_API_TOKEN
Value: duffel_live_YOUR_TOKEN_HERE
Environment: Production, Preview, Development
```

```
Name: DUFFEL_API_URL
Value: https://api.duffel.com
Environment: Production, Preview, Development
```

#### Required for PostgreSQL Database:
```
Name: DATABASE_URL
Value: postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
Environment: Production, Preview, Development
```

**IMPORTANT:** Use your actual Neon PostgreSQL connection string from the .env file

#### Optional (for notifications):
```
Name: RESEND_API_KEY
Value: (your Resend API key)
Environment: Production, Preview, Development
```

```
Name: EMAIL_FROM
Value: noreply@flightrighttravel.international
Environment: Production, Preview, Development
```

```
Name: CONTACT_EMAIL
Value: (your business email)
Environment: Production, Preview, Development
```

### 5. Redeploy Your Site

After adding ALL environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the three dots (...) menu
4. Click **Redeploy**
5. Check "Use existing build cache" is **OFF**
6. Click **Redeploy**

### 6. Verify It Works

After deployment completes (2-3 minutes):

1. Visit: https://www.flightrighttravel.international/
2. Search for flights (e.g., Amsterdam to Cairo)
3. You should see **REAL flight data** from airlines
4. The message "Live flight search is unavailable" should show if API returns empty
5. NO MORE mock data (KLM 553, EgyptAir MS 758, Turkish Airlines TK 1952)

## What Changed

✅ **Removed all mock data** - No more hardcoded fake flights
✅ **Real API calls only** - Only shows actual Duffel flight data
✅ **Better error messages** - Clear feedback when API isn't configured
✅ **Database integration** - All bookings saved to PostgreSQL

## Troubleshooting

### Still Seeing Mock Data?

1. **Check environment variables are set** - Go to Vercel Settings → Environment Variables
2. **Verify deployment finished** - Check Vercel dashboard for "Ready" status
3. **Clear browser cache** - Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Check deployment logs** - Look for "DUFFEL_API_TOKEN" in build logs

### No Flights Showing?

If you see "No flights available for this route":
1. The Duffel API may not have flights for those dates/airports
2. Try different dates (future dates, not too far out)
3. Try major airports (Amsterdam AMS, Cairo CAI, Istanbul IST)
4. Check Vercel logs for API errors

### API Errors?

Check these:
- DUFFEL_API_TOKEN is correct (starts with `duffel_live_`)
- DATABASE_URL has `?sslmode=require` at the end
- No extra spaces in environment variable values
- Redeployed AFTER setting variables

## Contact Support

If you still have issues after following all steps:
1. Check Vercel deployment logs
2. Test the API directly: https://www.flightrighttravel.international/api/flights/search
3. Verify your Duffel account is active at https://app.duffel.com/
