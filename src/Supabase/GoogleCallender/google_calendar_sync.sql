-- ─────────────────────────────────────────────────────────────
--  ✱ GOOGLE CALENDAR SYNC
--    Purpose: push booked calls to the agent’s Google Calendar.
-- ─────────────────────────────────────────────────────────────
-- 📌 WRITE HUMAN-READABLE INSTRUCTIONS HERE
--    • OAuth flow: how you store refresh tokens in table `google_tokens`
--      (columns: user_id uuid, refresh_token text, access_token text, expires_at timestamptz).
--    • Required scopes (`calendar`, `calendar.events`).
--    • Which calendar to write to (primary vs specific ID).
--    • Error handling / retry policy.

-- === RAW POSTGRES CODE START ===
-- 0. Dependencies
create extension if not exists pg_cron;
create extension if not exists http;  -- https://github.com/pramsey/pgsql-http

-- 1. Table holding OAuth tokens (simplified example)
create table if not exists google_tokens (
  user_id       uuid primary key,
  refresh_token text    not null,
  access_token  text,
  expires_at    timestamptz
);

-- 2. PL/pgSQL function that:
--    • Refreshes access_token when expired
--    • Inserts a Google Calendar event via https POST
create or replace function sync_booked_to_gcal()
returns void language plpgsql as
$$
declare
  rec record;
  tok record;
  resp json;
begin
  for rec in
    select b.*, r.uuid as user_id
      from booked b
      join realtors r on r.realtor_id = b.realtor_id
     where b.synced is false  -- add this column yourself
  loop
    select * into tok from google_tokens where user_id = rec.user_id;

    -- refresh the access token if needed  (call Google OAuth token endpoint)
    if tok.expires_at < now() then
      resp := http_post(
        'https://oauth2.googleapis.com/token',
        format(
          'client_id=%s&client_secret=%s&refresh_token=%s&grant_type=refresh_token',
          current_setting('gcal.client_id'),
          current_setting('gcal.client_secret'),
          tok.refresh_token
        ),
        'application/x-www-form-urlencoded'
      )::json;

      update google_tokens
         set access_token = resp->>'access_token',
             expires_at   = now() + (resp->>'expires_in')::int * interval '1 second'
       where user_id = rec.user_id;

      tok.access_token := resp->>'access_token';
    end if;

    -- create the calendar event
    perform http_post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      json_build_object(
        'summary', format('Call with %s', rec.full_name),
        'start',   json_build_object('dateTime', to_char(rec.booked_date || rec.booked_time, 'YYYY-MM-DD"T"HH24:MI:SS')),
        'end',     json_build_object('dateTime', to_char(rec.booked_date || rec.booked_time, 'YYYY-MM-DD"T"HH24:MI:SS'))
      )::text,
      'application/json',
      format('Authorization: Bearer %s', tok.access_token)
    );

    update booked set synced = true where phone = rec.phone;
  end loop;
end;
$$;

-- 3. Schedule it every 15 minutes
select cron.schedule(
  'gcal_sync',
  '*/15 * * * *',
  $$call sync_booked_to_gcal();$$
);

-- === RAW POSTGRES CODE END ===
