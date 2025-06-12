# Database Schema

This document summarizes the main tables used by the Lead Management System.
The table definitions can be found in [`database/postgres.sql`](../database/postgres.sql).
Example data for local development is provided in [`database/seed.sql`](../database/seed.sql).

## Tables

### Realtor
- `realtor_id` – primary key
- `uuid` – unique identifier
- `phone`
- `f_name` – first name
- `e_name` – last name
- `video_url`
- `email`
- `website_url`
- `created_at`

### Leads
- `phone` – primary key
- `realtor_id` – references `Realtor`
- `first_name`
- `last_name`
- `address` – typically ZIP code
- `lead_state` – booked/hot/warm/cold
- `home_type` – `home_type_enum`
- `bedrooms` – `bedrooms_enum`
- `bathrooms` – `bathrooms_enum`
- `sqft` – `sqft_enum`
- `home_built` – `year_built_enum`
- `occupancy` – `occupancy_enum`
- `willing_to_sell` – `changes_enum`
- `sell_time` – `timeframe_enum`
- `professional` – `professional_enum`
- `expert` – `expert_enum`
- `working_with_agent`
- `looking_to_buy`
- `ad_id`
- `sent_schedule_reminder`
- `created_at`

### Bookings
- `booking_id` – primary key
- `phone` – references `Leads`
- `realtor_id` – references `Realtor`
- `appointment_time`
- `google_calendar_id`
- `google_event_id`
- `status`
- `created_at`
- `updated_at`
- unique `(realtor_id, appointment_time)` to prevent double booking

### Messages
- `phone` – references `Leads`
- `messages_conversation` – JSON payload

### scheduled_messages
- `id` – primary key
- `phone` – references `Leads`
- `realtor_id` – references `Realtor`
- `scheduled_time`
- `message_type`
- `message_status`
- `message_text`
- `created_at`
- rows are processed by the cron job in `backend/src/scheduler/cron.ts`

### message_logs
- `id` – primary key
- `phone`
- `message_type`
- `message_text`
- `sent_at`
- `status`

### google_credentials
- `realtor_id` – references `Realtor`
- `access_token`, `refresh_token`
- `token_expires`
- `created_at`

### google_calendar_events
- `id` – primary key
- `realtor_id` – references `Realtor`
- `google_event_id` – unique Google event identifier
- `summary`, `description`
- `start_time`, `end_time`
- `created_at`

## Example Data
The seed script inserts two sample leads and a booked appointment:
```sql
INSERT INTO Leads (...)
    ('555-0001', 1, 'Eve', 'Example', '123 Main St', ...),
    ('555-0002', 2, 'John', 'Doe', '456 Oak Ave', ...);
INSERT INTO Bookings (phone, realtor_id, appointment_time, google_calendar_id, google_event_id)
VALUES ('555-0001', 1, NOW(), 'primary', 'abc123');
```
See [`database/seed.sql`](../database/seed.sql) for the full statements.

## Loading the Schema
Run `scripts/load_supabase.sh` with the `SUPABASE_DB_URL` environment variable set to your Postgres connection string:
```bash
export SUPABASE_DB_URL="postgres://user:pass@host:port/db"
./scripts/load_supabase.sh
```
The script loads `database/postgres.sql` and `database/seed.sql` into the target database.
