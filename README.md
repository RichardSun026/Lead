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
   npm --workspace frontend/StartPage run preview -- --port 4173
   npm --workspace frontend/site run preview -- --port 4177
   npm --workspace frontend/survey run preview -- --port 4174
   npm --workspace frontend/RealtorInterface/Onboarding run preview -- --port 4175
   npm --workspace frontend/RealtorInterface/LeadReports run preview -- --port 4176
   ```
  - API: <https://www.myrealvalaution.com/api>
  - Start page: <https://www.myrealvalaution.com/>
  - Landing page: <https://www.myrealvalaution.com/s> (hosted at `/s`)
  - Survey site: <https://www.myrealvalaution.com/survey>
   - Lead reports: <https://www.myrealvalaution.com/console/reports>

To work on either front end individually, run `npm run dev` inside its folder. See the [docs directory](docs/README.md) for environment variables, database schema and other guides.

## Docker Compose

All services can be started with Docker:
```bash
docker-compose up --build
```
This brings up the API, both front ends and Redis using the same ports as above.

### Deployment (host Nginx)
Ubuntu’s built-in Nginx now owns ports **80/443**. All Docker services expose
high ports on `https://www.myrealvalaution.com/*`; the vhost file
`deploy/host-nginx/myrealvaluation.conf` maps paths to those ports.

```bash
docker compose up -d --build        # start Redis, API, and SPA containers
sudo cp deploy/host-nginx/myrealvaluation.conf \
     /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/myrealvaluation.conf \
          /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

If you see “address already in use,” stop any legacy proxy containers:

```bash
docker rm -f lead-proxy || true
```
