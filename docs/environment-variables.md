# Environment Variables

This page summarises the variables defined in `.env.example` and what they are used for.

## Supabase
- `SUPABASE_URL` – URL of the Supabase instance used by the Nest backend.
- `SUPABASE_ANON_KEY` – public API key allowing anonymous access to Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` – service role key for privileged operations in Supabase.

## WhatsApp Cloud API
- `WA_PHONE_NUMBER_ID` – phone number identifier used when sending WhatsApp messages.
- `WA_TOKEN` – bearer token for authenticating requests to Meta's Graph API.
- `WA_VERIFY_TOKEN` – secret used to validate webhook calls.
  Incoming webhook requests should target `/webhook/whatsapp`.

## Third‑party APIs
- `OPENAI_API_KEY` – key for generating AI responses via OpenAI.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` – OAuth
  credentials used when syncing Google Calendar events.

## User Data Site
- `USER_DATA_PASSWORD` – password required to generate a user data report.

## Deployment
- `SERVER_IP` – target server address for `docker-deploy.sh`.
- `SERVER_USER` – SSH user for deployment (default `root`).
- `SERVER_PASSWORD` – password for the SSH user.
- `SERVER_PORT` – SSH port (default `22`).
- `DOCKER_USERNAME` – Docker Hub username used when tagging images.

## Miscellaneous
- `WEBHOOK_URL` – endpoint that receives lead data (used by the Facebook form utilities).
- `MESSAGE_LIMIT` – maximum number of messages a user can receive before further texts are ignored.
