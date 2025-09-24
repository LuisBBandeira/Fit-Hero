# Email Service Configuration for Password Reset

## Gmail Setup (Recommended)

To enable password reset emails, you need to configure Gmail with an App Password:

### 1. Create Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already enabled)
3. Go to **App passwords**
4. Create a new app password for "Mail"
5. Copy the generated 16-character password

### 2. Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration for Password Reset
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password

# Make sure you also have these for the reset URLs
NEXTAUTH_URL=http://localhost:3000
# For production: NEXTAUTH_URL=https://your-domain.com
```

### 3. Testing the Email Service

You can test the email service by:

1. Starting your development server: `npm run dev`
2. Going to `/forgot-password`
3. Entering your email address
4. Checking your email for the reset link

## Alternative Email Services

### SendGrid (Production Alternative)

If you prefer SendGrid over Gmail:

1. Sign up at https://sendgrid.com/
2. Get your API key
3. Update the email service in `/src/app/api/auth/forgot-password/route.ts`:

```typescript
// Replace the Gmail transporter with:
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
})
```

4. Update your environment variables:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_USER=noreply@yourdomain.com
```

### SMTP Server

For other SMTP servers:

```typescript
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
```

## Security Notes

- App passwords are more secure than regular passwords for automated systems
- Never commit your `.env.local` file to version control
- The email service intentionally doesn't reveal whether an email exists in the system
- Reset tokens expire after 1 hour for security
- Used tokens are automatically deleted after password reset

## Email Templates

The system sends different email templates based on account type:

1. **Password Reset Email**: For users with email/password accounts
2. **OAuth Account Email**: For users who only have OAuth accounts (Google/GitHub)

Both emails use a terminal/hacker theme to match your application's design.

## Troubleshooting

### Common Issues:

1. **"Invalid credentials"**: Check your app password is correct
2. **"Less secure app access"**: Use App Password instead of regular password
3. **Emails not arriving**: Check spam folder, verify EMAIL_USER is correct
4. **Token expired**: Reset tokens expire after 1 hour

### Testing Commands:

```bash
# Test the forgot password API directly
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check database for verification tokens
npx prisma studio
# Look at the verification_tokens table
```
