# Lead Management System

This repository hosts a monorepo used to experiment with lead generation and booking flows.  It contains a small NestJS backend and two React applications.  Leads and bookings are stored in Supabase while conversation history is kept in Redis.

![Site inspiration](InspirationForSite.png)

## Applications

- **apps/site** – landing page with a calendar video and booking form
- **apps/user-report** – admin tool that displays user reports based on stored leads and messages

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```

See the [docs directory](docs/README.md) for additional notes such as the database schema and sample scripts.
