# Email Deliverability Guide

This guide covers how to improve email deliverability for your TanStack Start application using Resend.

## What We've Implemented

### ✅ HTML Email Templates

- **Professional design** with proper email HTML structure
- **Mobile-responsive** tables and inline CSS
- **Clear CTAs** with prominent buttons
- **Branded styling** consistent with the application
- **Security messaging** for password resets

### ✅ Enhanced Sender Configuration

- **Descriptive subjects** with application branding
- **Error handling** with proper logging
- **Email tagging** for tracking and categorization
- **Custom headers** for better deliverability

## DNS Configuration Required

To avoid spam folders, you MUST configure these DNS records for your domain:

### 1. SPF Record

Add this TXT record to your domain:

```txt
v=spf1 include:_spf.resend.com ~all
```

### 2. DKIM Record

Resend will provide you with DKIM records after domain verification. Add them to your DNS.

### 3. DMARC Record

Add this TXT record to `_dmarc.yourdomain.com`:

```txt
v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

## Domain Setup in Resend

1. **Add your domain** in Resend dashboard
2. **Verify ownership** by adding the verification TXT record
3. **Configure DKIM** by adding the provided records
4. **Update sender address** to use your verified domain

## Current Configuration

### Email Templates Location

- `src/modules/email/templates/email-verification.tsx`
- `src/modules/email/templates/password-reset.tsx`

### Sender Configuration

- **From Address**: `"Tanstack Start Starter <support@start-starter.jacebabin.com>"`
- **Subject Format**: Clear, branded subjects with action context
- **Content**: HTML templates with fallback text

## Deliverability Best Practices

### ✅ Already Implemented

- Professional HTML email templates
- Branded from address and subject lines
- Proper email headers and tagging
- Error handling and logging
- Mobile-responsive design

### 🔄 Requires DNS Setup

- SPF record for domain authentication
- DKIM signing for message integrity
- DMARC policy for spam protection
- Domain verification in Resend

### 📈 Ongoing Improvements

- Monitor bounce rates and engagement
- A/B test subject lines and content
- Maintain sender reputation
- Regular deliverability audits

## Testing Email Deliverability

### 1. Test Different Email Providers

```bash
# Test with major providers
- Gmail (@gmail.com)
- Outlook (@outlook.com, @hotmail.com)
- Yahoo (@yahoo.com)
- Apple Mail (@icloud.com)
```

### 2. Check Spam Folders

- Always check spam/junk folders initially
- Look for delivery to inbox after DNS setup

### 3. Monitor Resend Dashboard

- Check delivery rates and bounces
- Monitor open rates and engagement
- Review any blacklist issues

## Environment Variables

Ensure these are properly configured:

```env
RESEND_API_KEY=re_your_api_key_here
SENDER_EMAIL_ADDRESS="Your App <noreply@yourdomain.com>"
```

## Troubleshooting Common Issues

### Emails Going to Spam

1. **Check DNS records** (SPF, DKIM, DMARC)
2. **Verify domain** in Resend dashboard
3. **Use branded sender** address with verified domain
4. **Avoid spam trigger words** in subject/content

### Low Delivery Rates

1. **Monitor bounce rates** in Resend dashboard
2. **Clean email lists** regularly
3. **Maintain engagement** with relevant content
4. **Follow authentication standards**

### Template Issues

1. **Test across email clients** (Gmail, Outlook, etc.)
2. **Use email testing tools** like Litmus or Email on Acid
3. **Validate HTML structure** for email compatibility
4. **Ensure mobile responsiveness**

## Next Steps

1. **Set up DNS records** for your domain
2. **Verify domain** in Resend dashboard
3. **Update sender address** to use verified domain
4. **Test delivery** across email providers
5. **Monitor metrics** and adjust as needed

---

_This configuration should significantly improve email deliverability compared to plain text emails from unverified domains._
