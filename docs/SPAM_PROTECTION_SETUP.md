# Contact Form Spam Protection Setup

## Overview

The contact form now includes multiple layers of spam protection to prevent automated bot submissions and spam messages.

## Protection Layers Implemented

### 1. **Google reCAPTCHA v3**
- Invisible verification that analyzes user behavior
- Provides a score indicating likelihood of being a bot
- No user interaction required (no checkboxes or puzzles)

### 2. **Honeypot Field**
- Hidden field that humans won't see or fill
- Bots typically fill all fields automatically
- Any submission with this field filled is rejected

### 3. **Time-Based Protection**
- Tracks how long the form is open before submission
- Rejects submissions faster than 3 seconds (too fast for humans)
- Rejects submissions older than 1 hour (expired forms)

### 4. **Content Pattern Detection**
- Scans messages for common spam keywords (viagra, casino, lottery, etc.)
- Detects excessive URLs (more than 2)
- Identifies repeated characters and excessive uppercase
- Blocks money-related spam patterns

### 5. **Server-Side Validation**
- All client-side checks are duplicated on the server
- Prevents bypassing JavaScript-based protection
- Validates all fields before forwarding to backend

## Setup Instructions

### Step 1: Get Google reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "+" to create a new site
3. Fill in the form:
   - **Label**: Hotel Le Process Contact Form
   - **reCAPTCHA type**: Select "reCAPTCHA v3"
   - **Domains**: Add your domains:
     - `hotel-leprocess.com`
     - `www.hotel-leprocess.com`
     - `localhost` (for testing)
4. Accept the terms and click "Submit"
5. Copy both keys:
   - **Site Key** (public key - used in frontend)
   - **Secret Key** (private key - used in backend)

### Step 2: Update Environment Variables

#### Frontend (.env file)
```bash
# Add to your .env file
RECAPTCHA_SITE_KEY=your-actual-site-key-here
```

#### Backend (.env file)
```bash
# Add to your backend .env file
RECAPTCHA_SECRET_KEY=your-actual-secret-key-here
```

### Step 3: Update Backend API

Your backend needs to verify the reCAPTCHA token. Add this to your `/api/public/contact` endpoint:

```javascript
const axios = require('axios');

router.post('/api/public/contact', async (req, res) => {
    const { name, email, subject, message, recaptcha_token } = req.body;
    
    // Verify reCAPTCHA token
    try {
        const recaptchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptcha_token
                }
            }
        );
        
        const { success, score } = recaptchaResponse.data;
        
        // Reject if reCAPTCHA verification fails or score is too low
        if (!success || score < 0.5) {
            console.log('reCAPTCHA verification failed:', { success, score });
            return res.status(400).json({ 
                error: 'Spam detection failed. Please try again.' 
            });
        }
        
        console.log('reCAPTCHA score:', score);
        
        // Continue with your existing contact form logic...
        // Send email, save to database, etc.
        
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return res.status(500).json({ 
            error: 'Verification error. Please try again.' 
        });
    }
});
```

### Step 4: Deploy Changes

1. Commit the changes to your repository
2. Update environment variables on your production server
3. Deploy the updated code
4. Test the contact form

## Testing

### Test the Spam Protection

1. **Normal Submission** (should work):
   - Fill out the form normally
   - Wait at least 3 seconds
   - Submit with valid content
   - Should receive success message

2. **Honeypot Test** (should fail):
   - Open browser console
   - Run: `document.getElementById('website').value = 'test'`
   - Submit form
   - Should be rejected

3. **Speed Test** (should fail):
   - Load the form
   - Immediately fill and submit (under 3 seconds)
   - Should be rejected with "take your time" message

4. **Spam Content Test** (should fail):
   - Enter message with spam keywords: "Win free casino lottery prize"
   - Should be rejected with "suspicious content" message

5. **URL Test** (should fail):
   - Enter message with 3+ URLs
   - Should be rejected

### Monitor Spam Attempts

Check your server logs for these messages:
- `Spam detected: honeypot field filled`
- `Spam detected: form submitted too fast`
- `Spam detected: suspicious content patterns`
- `reCAPTCHA verification failed`

## Customization

### Adjust Time Threshold

In `contact.ejs` and `pages.js`, change the 3-second minimum:

```javascript
if (timeDiff < 5) { // Change to 5 seconds
```

### Add More Spam Keywords

In `contact.ejs`, add to the `spamPatterns` array:

```javascript
const spamPatterns = [
    /\b(viagra|cialis|casino|poker|lottery|winner|prize|claim|click here|buy now)\b/i,
    /\b(your-new-keyword|another-keyword)\b/i, // Add your keywords
    // ... rest of patterns
];
```

### Adjust reCAPTCHA Score Threshold

In your backend, change the minimum score (0.0 to 1.0):

```javascript
if (!success || score < 0.3) { // Lower = more lenient, Higher = stricter
```

Recommended scores:
- **0.3**: Very lenient (catches obvious bots)
- **0.5**: Balanced (recommended)
- **0.7**: Strict (may block some legitimate users)

## Troubleshooting

### Issue: Form always fails with "verification error"

**Solution**: Check that:
- reCAPTCHA keys are correctly set in environment variables
- Site key matches the domain you're testing on
- Backend has internet access to reach Google's API

### Issue: Legitimate users getting blocked

**Solution**: 
- Lower the reCAPTCHA score threshold
- Reduce the minimum time from 3 to 2 seconds
- Review and adjust spam keyword patterns

### Issue: Still receiving spam

**Solution**:
- Check server logs to see which protection layer is being bypassed
- Increase reCAPTCHA score threshold to 0.7
- Add more specific spam patterns based on the spam you're receiving
- Consider adding rate limiting per IP address in your backend

## Additional Recommendations

1. **Add Rate Limiting**: Implement IP-based rate limiting in your backend (e.g., max 5 submissions per hour per IP)

2. **Email Verification**: Consider sending a verification email before processing the contact request

3. **CAPTCHA Fallback**: For users with very low reCAPTCHA scores, show a visible CAPTCHA challenge

4. **Monitoring**: Set up alerts for high spam detection rates

5. **Blacklist**: Maintain a list of known spam email domains/IPs

## Support

For issues or questions:
- Check Google reCAPTCHA documentation: https://developers.google.com/recaptcha/docs/v3
- Review server logs for specific error messages
- Test in browser console for debugging

## Security Notes

- Never commit your secret keys to version control
- Keep your `.env` file in `.gitignore`
- Rotate keys periodically
- Monitor reCAPTCHA admin console for suspicious activity
