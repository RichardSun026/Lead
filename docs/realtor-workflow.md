# Realtor Workflow Overview

This document describes the typical path a realtor follows through the system starting from the public start page. It also notes which database tables are touched and highlights some potential issues.

## 1. Start Page
- The marketing site located at `/` introduces the service and includes a **Get Started – Realtor Sign-Up** button.
- The button links to `/onboarding` for new realtors.

## 2. Onboarding Flow
1. **Google Login** – the onboarding app uses Google OAuth for authentication.
2. **Personal Info** – the realtor enters name and phone number.
3. **Create Account** – a Supabase user is created automatically after Google sign in.
4. **Connect Google Calendar** – a call to `/api/calendar/oauth/<realtorId>` opens Google's consent screen. After approval the backend stores tokens in the `google_credentials` table.
5. After completion the realtor is redirected to the console at `/console`.

During onboarding the backend creates a row in the `realtor` table containing the realtor’s ID and name.

## 3. Console
- Located at `/console` and implemented with React Router.
- The console fetches lead data from `/api/leads`, which queries the `leads` table, to display phone numbers and names.
- Selecting a lead opens `/console/reports/<phone>` which retrieves a summary from `/api/reports/:phone`.
- Each report includes contact info, survey answers and message summaries. These summaries are cached in Redis and stored in `message_logs`.

## 4. Booking and Calendar Integration
- When a homeowner books a time slot the `bookings` table stores the appointment and a Google Calendar event is created via the Calendar service.
- Follow‑up messages are scheduled in the `scheduled_messages` table and later sent by the Scheduler service.

## 5. Potential Issues
 - The server logs an error if `WA_PHONE_NUMBER_ID` is missing in the environment configuration.
- Nginx must proxy each SPA path correctly or deep links will 404.
- Time zone handling for bookings can lead to incorrect reminders if not configured consistently.
- Missing Google OAuth tokens will prevent calendar updates until the realtor reconnects their account.

