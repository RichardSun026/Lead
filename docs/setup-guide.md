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
4. Build and preview the full stack with one command:
   ```bash
   npm run master-switch
   ```
   - API: <http://localhost:3000>
   - Landing page: <http://localhost:4173>
   - Survey site: <http://localhost:4174>

## Docker Compose

To run all services in containers (backend, landing page, survey site and Redis):

```bash
docker-compose up --build
```

Make sure your environment variables from `backend/.env` are available when starting the containers. When running through Docker Compose the services will be accessible at the same ports listed above and Redis will listen on `localhost:6379`.
