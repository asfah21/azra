# Security Features Implementation

This document outlines the security features implemented in the application.

## 1. Input Validation with Zod

All form inputs are validated using Zod schemas to ensure data integrity and prevent injection attacks.

### Key Validations:
- Required field validation
- Data type validation
- Enum validation for fields like priority and shift
- Custom validation for dates and numbers
- Array validation for components

## 2. Rate Limiting

Rate limiting is implemented using Upstash Redis to prevent abuse and brute force attacks.

### Configuration:
- 5 requests per hour per IP address in production
- Rate limiting is disabled in development mode
- Custom error messages for rate-limited requests

### Setup:
1. Sign up for Upstash Redis
2. Add your Redis credentials to `.env`:
   ```
   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
   ```

## 3. Google reCAPTCHA v2

reCAPTCHA v2 is implemented to prevent automated form submissions.

### Setup:
1. Register your site at [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Add your site key to your frontend form
3. Add your secret key to `.env`:
   ```
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

### Implementation Details:
- Server-side validation of reCAPTCHA token
- Graceful degradation if reCAPTCHA is not configured
- Custom error messages for failed verifications

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

## Development vs Production

- In development (`NODE_ENV=development`), rate limiting is disabled
- In production (`NODE_ENV=production`), all security features are enforced
- Always ensure your `.env` file is not committed to version control

## Testing

To test the security features:

1. **Validation**: Submit the form with invalid data to see validation messages
2. **Rate Limiting**: Make more than 5 requests in an hour to test rate limiting
3. **reCAPTCHA**: Test with invalid tokens to ensure validation works
