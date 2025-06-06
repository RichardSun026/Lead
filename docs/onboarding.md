# Realtor Onboarding

This short guide explains how to link a Google Calendar so that bookings created through the website and the AI are kept in sync.

The admin dashboard exposes a **Link Google Calendar** button during the onboarding process. Clicking it will open the Google consent screen using the `/api/calendar/oauth/<realtorId>` endpoint. After granting access the backend receives a refresh token so future calendar calls work without additional prompts.

1. Ensure the backend is running and accessible. The `GOOGLE_REDIRECT_URI` environment variable must point to
   `http://<server>/api/calendar/oauth/callback` (or your deployed URL).
2. Obtain your personal authorization link by calling:
   ```bash
   curl http://<server>/api/calendar/oauth/<realtorId>
   ```
   The response contains a `url` field. Open it in your browser.
3. Grant access to the requested Google account and confirm the consent screen.
4. After approval you will be redirected back to the callback endpoint and the
   backend stores your refresh token in Supabase.

Once this flow is completed, the application can create, update and delete
calendar events without asking for permission again. Tokens are refreshed
automatically.
