# Lead Management System

This repository contains a small NestJS backend and two React front ends used to capture leads and schedule bookings. Data is stored in Supabase and Redis is used for conversation history.

## Directory Structure

- **backend/** – API server and background jobs
- **frontend/site** – landing page with booking calendar
- **frontend/survey** – survey that collects property information
- **database/** – SQL schema and utilities
- **docs/** – project documentation

  - API: <https://br.myrealvaluation.com/api>
  - Start page: <https://br.myrealvaluation.com/>
  - Landing page: <https://br.myrealvaluation.com/s>
  - Survey site: <https://br.myrealvaluation.com/survey>
  - Console: <https://br.myrealvaluation.com/console>

## Running with Docker Compose

All services can be started with Docker:
```bash
docker-compose up --build
```
This brings up the API, both front ends and Redis using the same ports as above.

### Deployment (host Nginx)
Ubuntu’s built-in Nginx now owns ports **80/443**. All Docker services expose
high ports on `https://br.myrealvaluation.com/*`; the vhost file
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
.