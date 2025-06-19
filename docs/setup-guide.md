# Setup Guide

This guide explains how to configure the project for local development and how to run all services with Docker.

## Prerequisites

- Node.js 20+
- Docker and Docker Compose

## Local development

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `backend/.env.example` to `backend/.env` and fill in the required values. See [Environment Variables](environment-variables.md) for details.
3. Start the backend in development mode if desired:
   ```bash
   npm run start:dev
   ```
4. Build the project:
   ```bash
   npm run build
   ```
   Start the backend with:
   ```bash
   npm run start:prod
   ```
   In separate terminals preview each front end:
   ```bash
   npm --workspace frontend/StartPage run preview -- --port 4173
   npm --workspace frontend/site run preview -- --port 4177
   npm --workspace frontend/survey run preview -- --port 4174
   npm --workspace frontend/RealtorInterface/Onboarding run preview -- --port 4175
   npm --workspace frontend/RealtorInterface/Console run preview -- --port 4176
   ```
   - API: <https://www.myrealvaluation.com/api>
   - Start page: <https://www.myrealvaluation.com/>
   - Landing page: <https://www.myrealvaluation.com/s> (hosted at `/s`)
  - Survey site: <https://www.myrealvaluation.com/survey>
  - Console: <https://www.myrealvaluation.com/console>

## Docker Compose

To run all services in containers (backend, landing page, survey site and Redis):

```bash
docker compose --env-file backend/.env up --build
```

Make sure the `backend/.env` file exists and contains your Supabase and API keys. Using `--env-file` loads these variables when building the images so the frontends receive `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` during `npm run build`.
When running through Docker Compose the services will be accessible at the same ports listed above and Redis will listen on `https://www.myrealvaluation.com:6379`.
