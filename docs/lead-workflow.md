# Lead Workflow Overview

This guide follows a prospect from the initial survey through booking and follow‑up messaging. It also notes the database tables that store each piece of information and highlights common issues.

## 1. Completing the Survey

1. The visitor opens `/survey/<realtorId>` and fills out the questions.
2. On submission the front‑end sends a `POST /api/leads` request with the contact information, the browser's time zone and survey answers.
3. `LeadsService.createLead` verifies the realtor ID and upserts the record into the `leads` table. The phone number is normalised before storage.
4. A welcome message can be scheduled via `POST /api/schedule` which writes to `scheduled_messages`.
5. Depending on answers the user is either redirected to the booking site or shown a thank you message.

Realtors can later view submitted leads through the console, which calls `GET /api/leads` to return entries marked as `booked` or `hot`.

Possible errors:
- Missing or malformed `realtorId` returns `400`.
- Supabase failures when inserting the lead result in a `500` from the API.

## 2. Booking a Meeting

If the user proceeds to the site, the SPA calls `POST /api/bookings` to reserve a time slot.

1. `BookingService.createOrUpdate` checks for an existing booking by querying the `bookings` table.
2. It verifies that the requested time is not already in `bookings` or `google_calendar_events`.
3. A Google Calendar event is created and stored in `google_calendar_events` via the `CalendarService`.
4. The booking details are upserted in the `bookings` table and a confirmation SMS is sent through `MessengerService`. Each SMS is logged to `message_logs`.
5. Follow‑up reminders are inserted into `scheduled_messages` for one day and one hour before the meeting.

Possible errors:
- Time slots already booked cause `400` responses.
- Missing Google OAuth credentials prevent calendar updates and throw an error.

## 3. Messaging Flow

Users who do not book immediately—or anyone replying to WhatsApp messages—interact through the Messenger service.

1. Incoming messages are received from the WhatsApp Cloud API at `/webhook/whatsapp` and passed to `MessengerService.sendSms` after generating a reply with OpenAI.
2. Conversations are stored in Redis for context. Each outbound or failed message inserts a row in `message_logs`.
3. The Scheduler cron processes rows in `scheduled_messages` whose `scheduled_time` is due, sending SMS and marking the row as `sent` or `failed`.

Common problems include:
- Invalid Meta credentials causing send failures.
- The scheduler not running if `SCHEDULER_INTERVAL_MS` is misconfigured.

## 4. Database Tables Involved

- `leads` – survey answers and contact info.
- `bookings` – confirmed appointment times.
- `scheduled_messages` – pending or sent reminder texts.
- `message_logs` – history of all outbound SMS.
- `google_credentials` – OAuth tokens for each realtor.
- `google_calendar_events` – mirror of events created in Google Calendar.

Supabase acts as the central store and each service uses the service role key for inserts and updates.

## 5. Potential Issues

- Phone numbers must be valid and unique per lead, otherwise subsequent inserts overwrite the previous entry.
- Google OAuth tokens can expire if the refresh process fails, leading to missing calendar events.
- Network outages or misconfigured environment variables can halt the scheduler or messaging.

Understanding this flow helps troubleshoot lead handling from the moment a prospect submits the survey to the final follow‑up messages.
