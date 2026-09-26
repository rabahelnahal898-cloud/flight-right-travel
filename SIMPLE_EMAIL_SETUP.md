# 📧 SUPER SIMPLE Email Setup (5 MINUTES!)

## ✅ What You Get
Every support request will be sent to: **info@flightrighttravel.international**

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Gmail App Password (2 minutes)

1. Go to your Gmail account: https://mail.google.com
2. Click your profile picture → **Manage your Google Account**
3. Go to **Security** → **2-Step Verification** (enable if not already)
4. Scroll down to **App passwords**
5. Create a new app password:
   - App: Mail
   - Device: Other (custom name) → Type "Flight Right Website"
6. **COPY the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Update .env File

Open `Travel-Planner/artifacts/api-server/.env` and update these lines:

```env
SMTP_USER=info@flightrighttravel.international
SMTP_PASSWORD=paste_your_app_password_here
CONTACT_EMAIL=info@flightrighttravel.international
```

### Step 3: Done! 🎉

That's it! Now every support request will be emailed to you automatically.

## 📱 WhatsApp (Optional)

WhatsApp notifications will appear in your server logs with a clickable link.
When you see a new request, click the link to send it via WhatsApp Web to +201282220484.

## 🧪 Testing

1. Go to your website's support form
2. Submit a test request
3. Check your email at info@flightrighttravel.international

## ❗ Troubleshooting

**Email not working?**
- Make sure you used an App Password (not your regular Gmail password)
- Check the email is: info@flightrighttravel.international
- Verify 2-Step Verification is enabled in Gmail

**Still not working?**
- Check server logs for errors
- Try using a different Gmail account temporarily to test

---

## Alternative: Use ANY Email Service

If you don't want to use Gmail, you can use:

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your@outlook.com
SMTP_PASSWORD=your_password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your@yahoo.com
SMTP_PASSWORD=your_app_password
```

### Other Email Provider
Ask your email provider for SMTP settings and use those!
