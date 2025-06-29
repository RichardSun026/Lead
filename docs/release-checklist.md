# Release Testing Checklist

Before publishing the Lead Management System, verify that the following features work as expected:

## Backend
- [ ] Database migrations run successfully and data persists across restarts.
- [ ] Redis data persists thanks to the `redis-data` volume.
- [ ] Background jobs and queues (BullMQ) process tasks correctly.
- [ ] Environment variables are loaded and validated.
- [ ] Make this github is private.

## Frontend
- [ ] Landing page loads with booking calendar and submits appointments.
- [ ] Survey flows through all questions and submits results to the API.
- [ ] Realtor onboarding and console pages authenticate and display data from Supabase.
- [ ] Static assets build correctly via Vite in all frontend apps.

## Integration
- [ ] Supabase connection works and tables update when actions are taken.
- [ ] Redis stores conversation history and is cleared when expected.
- [ ] WhatsApp message sending and scheduling delivers messages on time.

## Deployment
- [ ] Docker images build without errors and containers start via `docker compose`.
- [ ] Nginx routes traffic to the correct high ports.
- [ ] HTTPS certificates are valid and renewed.

## End-to-End Flow
- [ ] A user can complete the survey, schedule a follow-up message, and receive WhatsApp notifications.
- [ ] Realtors can sign up, view leads in the console, and receive updates.

Use this checklist to guide manual and automated testing prior to deployment.
