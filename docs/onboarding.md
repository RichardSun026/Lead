# Realtor Onboarding

This short guide explains how to link a Google Calendar so that bookings created through the website and the AI are kept in sync.

## Verify your email

On the first page you will be asked for your email address. After clicking **Send Link** check your inbox and open the verification URL. Once the email is confirmed, return to the onboarding page to continue with step 2.

The admin dashboard exposes a **Link Google Calendar** button during the onboarding process. Clicking it will open the Google consent screen using the `/api/calendar/oauth/<realtorId>` endpoint. After granting access the backend receives a refresh token so future calendar calls work without additional prompts.

1. Ensure the backend is running and accessible. The `GOOGLE_REDIRECT_URI` environment variable must point to
   `https://www.myrealvaluation.com/api/calendar/oauth/callback` (or your deployed URL).
2. Obtain your personal authorization link by calling:
   ```bash
   curl https://www.myrealvaluation.com/api/calendar/oauth/<realtorId>
   ```
   The response contains a `url` field. Open it in your browser.
3. Grant access to the requested Google account and confirm the consent screen.
4. After approval you will be redirected directly to `/console`. The backend
   automatically saves your Google refresh token so future calendar calls work
   without any additional steps.

Once this flow is completed, the application can create, update and delete
calendar events without asking for permission again. Tokens are refreshed
automatically.

## Adding your website and intro video

During step 2 of the onboarding you can optionally provide two additional fields:

1. **Website URL** – paste the link to your personal site or listings page.
2. **Video link** – copy the share URL from Vimeo and ensure it begins with
   `https://player.vimeo.com`.

If you are unable to follow these instructions, please email
`admin@myrealvaluation.com` so we can manually fix it for you.
