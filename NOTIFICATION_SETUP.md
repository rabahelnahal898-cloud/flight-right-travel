# Support Request Notification Setup

This document explains how to configure email and WhatsApp notifications for support requests.

## Current Configuration

Support request cards are now configured to be sent to:
- **Email**: info@flightrighttravel.international
- **WhatsApp**: +20 12 82220484

## Environment Variables Updated

The following environment variables have been configured in `.env.local`:

```env
CONTACT_EMAIL="info@flightrighttravel.international"
EMAIL_FROM="noreply@flightrighttravel.international"
WHATSAPP_RECIPIENT_NUMBER="+201282220484"
VITE_CONTACT_EMAIL="info@flightrighttravel.international"
VITE_CONTACT_PHONE="+201282220484"
VITE_WHATSAPP_NUMBER="+201282220484"
```

## Required Setup Steps

### 1. Email Notifications (Resend)

To enable email notifications, you need to set up Resend:

1. **Create a Resend account** at https://resend.com
2. **Verify your domain** (flightrighttravel.international):
   - Add the DNS records provided by Resend to your domain
   - Wait for verification (usually takes a few minutes)
3. **Get your API key**:
   - Go to API Keys in Resend dashboard
   - Create a new API key
   - Copy the key
4. **Update `.env.local`**:
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   ```

### 2. WhatsApp Notifications (Meta Business API)

To enable WhatsApp notifications, you need to set up Meta Business:

1. **Create a Meta Business account** at https://business.facebook.com
2. **Set up WhatsApp Business API**:
   - Go to https://developers.facebook.com
   - Create a new app or use an existing one
   - Add WhatsApp product to your app
3. **Get your credentials**:
   - **Phone Number ID**: Found in WhatsApp > API Setup
   - **Access Token**: Generate a permanent token in WhatsApp > API Setup
4. **Verify your phone number** (+20 12 82220484):
   - You'll receive a verification code via SMS
   - Enter it in the Meta Business dashboard
5. **Update `.env.local`**:
   ```env
   WHATSAPP_ACCESS_TOKEN="your_permanent_access_token_here"
   WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id_here"
   ```

### 3. Deploy to Vercel

After setting up both services, you need to add these environment variables to your Vercel deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:
   - `CONTACT_EMAIL`
   - `EMAIL_FROM`
   - `RESEND_API_KEY`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_RECIPIENT_NUMBER`
   - `VITE_CONTACT_EMAIL`
   - `VITE_CONTACT_PHONE`
   - `VITE_WHATSAPP_NUMBER`
4. **Redeploy** your application

## How It Works

When a user submits a support request through the website:

1. The form data is sent to `/api/service-requests` endpoint
2. The request is saved to the database with status "received"
3. The `notifyTeam()` function is called, which:
   - Sends an **email** to `info@flightrighttravel.international` via Resend
   - Sends a **WhatsApp message** to `+201282220484` via Meta Business API
4. Both notifications include:
   - Subject line with request ID and item
   - Customer name, email, phone
   - Service type and details

## Notification Format

**Email Subject**: `New service request [ID]: [Item]`

**Message Body**:
```
[Name] requested [Item] ([Service]).
Email: [Email]
Phone: [Phone]
Details: [Details]
```

## Testing

Once configured, you can test the notifications by:

1. Going to your website's support/service request form
2. Filling out and submitting a request
3. Checking:
   - Email inbox at info@flightrighttravel.international
   - WhatsApp messages at +201282220484

## Troubleshooting

### Email not received
- Verify Resend API key is correct
- Check domain verification status in Resend dashboard
- Check spam/junk folder
- Review Resend logs in their dashboard

### WhatsApp not received
- Verify phone number is registered with Meta Business
- Check access token is a permanent token (not temporary)
- Verify phone number ID is correct
- Check Meta Business API logs for errors
- Ensure phone number format includes country code: +201282220484

### Both notifications failing
- Check application logs for error messages
- Verify environment variables are set in production
- Ensure the application was redeployed after adding variables

## Support

For additional help:
- Resend Documentation: https://resend.com/docs
- Meta WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
