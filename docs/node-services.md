# Node Services Overview

This document outlines the Node.js services found in the `Logic` folder. For each service you will find information about how it is started, the available API endpoints, important environment variables and notes on MySQL usage.

## Calendar
- **Location**: `Logic/Calendar`
- **Startup script**: `node CalendarService.js` (invoked by `npm start`)
- **Key environment variables**:
  - `PORT` – port to listen on (default `3002`)
  - `GOOGLE_PROJECT_ID`, `GOOGLE_PRIVATE_KEY_ID`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_CERT_URL` – Google service account credentials
  - `CALENDAR_ID` – target Google Calendar ID
- **API endpoints**:
  - `POST /create-event` – creates a Google Calendar event
  - `GET /health` – basic health check
- **MySQL**: this service does not connect to MySQL; it only communicates with Google Calendar.

## Intermediary
- **Location**: `Logic/Intermediary`
- **Startup script**: `node Intermediary.js`
- **Key environment variables**:
  - `PORT` – port to listen on (default `5002`)
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – MySQL connection details
- **API endpoints**:
  - `POST /webhook` – accepts raw lead data and stores it in MySQL
- **MySQL**:
  - Retrieves `realtor_id` from the `Realtor` table using a lead UUID
  - Inserts or updates lead information in the `Leads` table

## Messaging (Messenger)
- **Location**: `Logic/Messaging`
- **Startup script**: `node Messenger.js`
- **Key environment variables**:
  - `PORT` – port to listen on (default `3000`)
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – MySQL connection details
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` – Twilio credentials
  - `OPENAI_API_KEY` – key for generating AI responses
- **API endpoints**:
  - `POST /send` – send a message via Twilio
  - `POST /webhook/twilio` – Twilio webhook for incoming SMS
- **MySQL**:
  - Logs each outbound and inbound message in the `message_logs` table
  - Stores conversation history in the `Messages` table
  - Reads lead details from the `Leads` table when preparing AI responses

## Scheduler
This functionality is now implemented inside the Nest backend.
- **Location**: `backend/src/scheduler`
- **Cron script**: `backend/src/scheduler/cron.ts`
- **API endpoints**:
  - `POST /schedule` – schedule an SMS with `phone`, `time` and `content` in the body
  - `POST /schedule/cancel/:phone` – cancel pending messages for a phone number
- **Database**: uses the `scheduled_messages` table in Supabase
- The Nest server automatically starts a job that periodically invokes `cron.ts` to send due messages via Twilio
