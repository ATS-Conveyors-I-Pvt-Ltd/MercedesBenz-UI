# 📧 Email Notification Service - Setup Guide

This guide will help you configure email notifications for the Mercedes-Benz Digital Assembly Platform.

## 🎯 Features

The email service provides:

1. **🔐 Login Alerts** - Instant notifications when users log into the system
2. **📊 Daily Activity Reports** - Automated daily summaries sent at 18:00 IST
3. **🔔 Custom Notifications** - Flexible notification system for important events

## 📋 Prerequisites

- Gmail account (or other SMTP email service)
- App-specific password (for Gmail)

## 🔧 Setup Instructions

### Step 1: Get Gmail App Password

If you're using Gmail, you need to create an app-specific password:

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "Signing in to Google," select **2-Step Verification** (you must enable this first)
4. At the bottom, select **App passwords**
5. Select **Mail** and choose your device
6. Click **Generate**
7. Copy the 16-character password (you'll use this in the next step)

### Step 2: Configure Environment Variables

1. Open the `.env` file in the project root:
   ```bash
   nano .env
   ```

2. Update the following values:

   ```env
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password-here

   # Admin Email (who receives notifications)
   ADMIN_EMAIL=admin@yourcompany.com
   ADMIN_NAME=Your Admin Name

   # App Settings
   APP_NAME=Mercedes-Benz Digital Assembly Platform
   APP_URL=http://localhost:5174

   # Feature Flags
   ENABLE_LOGIN_NOTIFICATIONS=true
   ENABLE_DAILY_REPORTS=true
   DAILY_REPORT_TIME=18:00
   ```

3. Save the file (Ctrl+O, then Ctrl+X in nano)

### Step 3: Restart the Server

After configuring the `.env` file, restart the development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

You should see:
```
✅ Email service initialized successfully
✅ Email service connection verified
📅 Daily report scheduled for 18:00 IST
```

## 🧪 Testing the Email Service

### Test Email Configuration

Visit: http://localhost:3001/api/test-email

You should see:
```json
{
  "success": true,
  "message": "Connection verified"
}
```

### Test Login Notification

1. Log in to the application
2. Check your admin email inbox
3. You should receive a "🔐 New Login Alert" email with user details

### Test Daily Report (Manual)

You can manually trigger a daily report by making a POST request:

```bash
curl -X POST http://localhost:3001/api/send-daily-report \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [],
    "stats": {
      "totalActivities": 0,
      "uniqueUsers": 0
    }
  }'
```

## 📧 Email Templates

### 1. Login Alert Email

Sent immediately when a user logs in:

- **Subject**: 🔐 New Login Alert - [User Name]
- **Contains**:
  - User name, email, and role
  - Login timestamp
  - IP address (currently shows "Local Network")

### 2. Daily Activity Report

Sent automatically at 18:00 IST every day:

- **Subject**: 📊 Daily Activity Report - [Date]
- **Contains**:
  - Total activities count
  - Unique users count
  - Login events count
  - Top 5 actions performed
  - Recent 10 activities
  - Details table with timestamps

## ⚙️ Configuration Options

### Change Daily Report Time

Edit the `.env` file:

```env
DAILY_REPORT_TIME=20:00  # Send at 8 PM IST
```

### Disable Specific Notifications

```env
ENABLE_LOGIN_NOTIFICATIONS=false  # Disable login alerts
ENABLE_DAILY_REPORTS=false        # Disable daily reports
```

### Use Different Email Service (e.g., Outlook)

```env
EMAIL_SERVICE=outlook
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## 🐛 Troubleshooting

### Issue: "Email service not configured"

**Solution**: Make sure you've updated the `.env` file with your actual email credentials.

### Issue: "Authentication failed"

**Solutions**:
1. Check that you're using an **app-specific password**, not your regular Gmail password
2. Ensure 2-Step Verification is enabled on your Google account
3. Verify the EMAIL_USER matches the account that generated the app password

### Issue: Emails not being sent

**Check**:
1. Server console for error messages
2. Visit http://localhost:3001/api/test-email to verify configuration
3. Check spam folder in your email
4. Ensure ENABLE_LOGIN_NOTIFICATIONS or ENABLE_DAILY_REPORTS is set to `true`

### Issue: Daily report not arriving

**Check**:
1. Server must be running at the scheduled time (18:00 IST)
2. Verify DAILY_REPORT_TIME in .env
3. Check server logs around the scheduled time
4. Ensure there are logs to send (check `Audit_Trial_Report_AutoSave` folder)

## 📁 Project Structure

```
mercedes-benz-react-app/
├── services/
│   └── emailService.js          # Email service module
├── server.js                     # Server with email endpoints
├── src/
│   └── context/
│       └── AuthContext.jsx      # Triggers login notifications
├── .env                          # Your email configuration
└── .env.example                  # Template for configuration
```

## 🔐 Security Notes

- **Never commit `.env` to version control**
- The `.env` file is already in `.gitignore`
- Use app-specific passwords, not your main account password
- Consider using environment-specific configurations for production

## 📊 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notify-login` | POST | Send login notification |
| `/api/send-daily-report` | POST | Send daily activity report |
| `/api/test-email` | GET | Test email configuration |

## 🎨 Customizing Email Templates

Email templates are defined in `services/emailService.js`. You can customize:

- HTML styling (colors, fonts, layout)
- Email content and messaging
- Logo and branding
- Additional data fields

To customize, edit the HTML template strings in the respective methods:
- `sendLoginNotification()` - Login alerts
- `sendDailyReport()` - Daily reports
- `sendCustomNotification()` - Custom messages

## 📞 Support

For issues or questions about the email service:

1. Check the server console logs
2. Verify your .env configuration
3. Test the email connection using the test endpoint
4. Review this documentation

---

**Last Updated**: February 10, 2026
**Version**: 1.0.0
