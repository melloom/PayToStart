# Hostinger Email Configuration Guide

This guide will help you configure your application to send emails using your Hostinger email account instead of Gmail.

## Step 1: Get Your Hostinger Email Credentials

1. Log in to your **Hostinger hPanel**
2. Go to **Email** → **Email Accounts**
3. Find your email account or create a new one
4. Note down:
   - Your full email address (e.g., `noreply@yourdomain.com`)
   - Your email password

## Step 2: Configure Environment Variables

Add these environment variables to your `.env.local` file (for local development) or your hosting platform (Vercel, etc.):

```bash
# Hostinger SMTP Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your_email_password_here
SMTP_FROM=your-email@yourdomain.com
```

### Important Notes:

- **SMTP_USER**: Your full Hostinger email address (e.g., `noreply@yourdomain.com`)
- **SMTP_PASSWORD**: Your email account password (the one you use to log into webmail)
- **SMTP_FROM**: Should match your SMTP_USER email address
- **SMTP_HOST**: Always use `smtp.hostinger.com` for Hostinger
- **SMTP_PORT**: Use `587` for TLS (recommended) or `465` for SSL
- **SMTP_SECURE**: Set to `false` for port 587, or `true` for port 465

## Step 3: Alternative Port Configuration (SSL)

If port 587 doesn't work, try SSL on port 465:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your_email_password_here
SMTP_FROM=your-email@yourdomain.com
```

## Step 4: Test Your Configuration

1. Restart your development server after updating environment variables
2. Create a test contract and send it to a client
3. Check if the email is sent from your Hostinger email address

## Troubleshooting

### Emails Not Sending

1. **Check credentials**: Make sure your email and password are correct
2. **Check port**: Try both 587 (TLS) and 465 (SSL)
3. **Check firewall**: Ensure your hosting provider allows outbound SMTP connections
4. **Check logs**: Look for error messages in your server logs

### Common Errors

- **"Invalid login"**: Check your email and password
- **"Connection timeout"**: Check if port 587 or 465 is blocked
- **"Authentication failed"**: Verify your email password is correct

## Migration from Gmail

If you're currently using Gmail and want to switch to Hostinger:

1. Remove or comment out Gmail variables:
   ```bash
   # GMAIL_USER=your-email@gmail.com
   # GMAIL_APP_PASSWORD=your_app_password
   ```

2. Add Hostinger variables (as shown above)

3. Restart your server

The system will automatically use `SMTP_USER` and `SMTP_PASSWORD` if they're set, falling back to Gmail variables only if SMTP variables are not present.

## Security Best Practices

- Never commit your `.env.local` file to version control
- Use a dedicated email account for sending automated emails (e.g., `noreply@yourdomain.com`)
- Consider using an app-specific password if Hostinger supports it
- Regularly rotate your email passwords
