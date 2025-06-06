# Pending Feature Issues

The following tasks track improvements around calendar integration and bookings. They are not yet implemented in the codebase.

## 1. OAuth onboarding flow
- **Goal:** Provide a seamless "Link Google Calendar" button in the onboarding UI.
- **Details:** When clicked the button should redirect to `/api/calendar/oauth/<realtorId>` and store the resulting refresh token. Update `docs/onboarding.md` with usage instructions.

## 2. Atomic booking creation
- **Goal:** POST `/bookings` should create the Google Calendar event and Supabase row inside a single transaction.
- **Details:** Prevent double-booking by checking existing events before insertion and making the calendar entry the single source of truth.

## 3. Rescheduling and cancellation
- **Goal:** Allow updating or deleting an existing booking.
- **Details:** Use `events.patch` or `events.delete` via the Calendar API along with Supabase updates so both sources stay in sync.

## 4. Reading openings
- **Goal:** Provide an endpoint to list available slots for a realtor.
- **Details:** Combine existing bookings and Google Calendar events to return openings so both the website and AI avoid conflicting times.

## 5. Time‑zone handling
- **Goal:** Always store ISO timestamps with explicit offsets.
- **Details:** Let the Google Calendar API perform time‑zone conversions to avoid off-by-one-hour errors.

