# Lead Management System

This repository contains a small NestJS backend and two React front ends used to capture leads and schedule bookings. Data is stored in Supabase and Redis is used for conversation history.

## Directory Structure

- **backend/** – API server and background jobs
- **frontend/site** – landing page with booking calendar
- **frontend/survey** – survey that collects property information
- **database/** – SQL schema and utilities
- **docs/** – project documentation

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) start the backend in watch mode:
   ```bash
   npm run start:dev
   ```
3. Build the project and start the services individually:
   ```bash
   npm run build
   npm run start:prod
   ```
   In other terminals preview each front end:
   ```bash
   npm --workspace frontend/site run preview -- --port 4173
   npm --workspace frontend/survey run preview -- --port 4174
   npm --workspace frontend/RealtorInterface/Onboarding run preview -- --port 4175
   npm --workspace frontend/RealtorInterface/LeadReports run preview -- --port 4176
   ```
   - API: <http://localhost:3000>
   - Landing page: <http://localhost:4173>
   - Survey site: <http://localhost:4174>
   - Lead reports: <http://localhost:4176/LeadReports>

To work on either front end individually, run `npm run dev` inside its folder. See the [docs directory](docs/README.md) for environment variables, database schema and other guides.

## Docker Compose

All services can be started with Docker:
```bash
docker-compose up --build
```
This brings up the API, all front ends and Redis. The landing page will be
available on ports 80 and 443, while the other sites use the ports listed above.
