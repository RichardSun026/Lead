-- ─────────────────────────────────────────────────────────────
--  ✱ CRON JOB (pg_cron)
--    Purpose: run a periodic task inside Postgres itself.
-- ─────────────────────────────────────────────────────────────
-- 📌 WRITE HUMAN-READABLE INSTRUCTIONS HERE
--    • What the job will do.
--    • How often it must run (cron expression).
--    • Any safety / rollback notes for prod.

-- === RAW POSTGRES CODE START ===
-- Enable cron once per database
create extension if not exists pg_cron;

-- Example placeholder: purge stale leads nightly at 03:00
select cron.schedule(
  'nightly_lead_purge',                 -- job name
  '0 3 * * *',                          -- minute hour dom mon dow
  $$delete from leads where created_at < now() - interval '90 days';$$
);

-- (Delete or modify the example; add more jobs below this line)
-- === RAW POSTGRES CODE END ===
