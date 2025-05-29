# Lead Management System

This repository hosts a monorepo used to experiment with lead generation and booking flows. It contains a small NestJS backend and two React applications. Leads and bookings are stored in Supabase while conversation history is kept in Redis.

![Site inspiration](InspirationForSite.png)

## Directory Structure

- **backend/** – NestJS API server
- **frontend/site** – landing page with a calendar video and booking form
- **frontend/user-report** – admin tool that displays user reports based on stored leads and messages
- **database/** – SQL scripts and helper tools
- **docs/** – additional project documentation

## Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend in development mode:
   ```bash
npm run start:dev
```

To develop or build the front ends:

```bash
# Example for the landing page app
cd frontend/site
npm install        # first-time setup only
npm run dev        # runs Vite dev server (view at http://localhost:5173)

# Build for production
npm run build
npm run preview    # optional: serve the built files locally
```

When running the landing page, navigate to `http://localhost:5173/<realtorUUID>/<userMarker>`.
The `userMarker` value can be generated using the `FinishFacebookInstantForm` script in
`docs/facebook-form.md`. The page fetches the realtor's video and calendar using the UUID provided
in the URL.

See the [docs directory](docs/README.md) for additional notes such as the database schema and sample scripts.

### Calendar Sync
The backend exposes `/calendar/:realtorId/events` to create and `/calendar/:realtorId/events/:eventId` to delete Google Calendar events.
Events are mirrored in Supabase tables `google_credentials` and `google_calendar_events`.

Planned improvements can be found in [TODO.md](TODO.md).
