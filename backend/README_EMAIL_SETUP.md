# Gmail Email Setup Guide

## Issue
The application is experiencing Gmail authentication errors. This is a common issue with Gmail's security policies.

## Solutions

### Option 1: Use App Password (Recommended - If 2FA is enabled)

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other (Custom name)" as device
   - Enter "SkillSwap Platform" as the name
   - Click "Generate"
   - Copy the 16-character password

3. **Update your config.env**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Option 2: Enable Less Secure App Access (If 2FA is disabled)

1. **Disable 2-Factor Authentication** (if enabled):
   - Go to https://myaccount.google.com/security
   - Disable "2-Step Verification"

2. **Enable Less Secure App Access**:
   - Go to https://myaccount.google.com/lesssecureapps
   - Turn on "Allow less secure apps"

3. **Update your config.env**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-regular-gmail-password
   ```

### Option 3: Use Gmail OAuth2 (Most Secure)

1. **Create a Google Cloud Project**:
   - Go to https://console.cloud.google.com/
   - Create a new project
   - Enable Gmail API

2. **Create OAuth2 Credentials**:
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Download the JSON file

3. **Update the email configuration** to use OAuth2

## Testing Email Configuration

After updating the credentials, restart your server and test the email functionality:

```bash
cd backend
npm run dev
```

The server will log whether the email configuration is working properly.

## Troubleshooting

### Common Error Messages:

1. **"Username and Password not accepted"**:
   - Check if you're using the correct email/password
   - Ensure App Password is used if 2FA is enabled
   - Ensure Less Secure App Access is enabled if 2FA is disabled

2. **"Invalid login"**:
   - Verify your Gmail credentials
   - Check if your account has any security restrictions

3. **"Connection timeout"**:
   - Check your internet connection
   - Verify firewall settings

## Security Notes

- Never commit your email credentials to version control
- Use environment variables for sensitive information
- Consider using a dedicated email service (SendGrid, Mailgun) for production
- Regularly rotate your App Passwords

## Alternative Email Services

For production, consider using dedicated email services:

1. **SendGrid**: Free tier available, easy setup
2. **Mailgun**: Developer-friendly, good documentation
3. **Amazon SES**: Cost-effective for high volume
4. **Resend**: Modern email API, great developer experience

These services provide better deliverability and more features than Gmail SMTP. 