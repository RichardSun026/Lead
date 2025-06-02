# Migration Plan: SiteOLD to React Site

This document outlines a step‑by‑step approach for porting the legacy **SiteOLD** ASP.NET application to the new React‑based front end that aligns with the current architecture.

## 1. Review Existing Functionality

`SiteOLD` provides booking and lead capture functionality using MVC controllers and Razor views. Key features include:

- Video player showing a realtor introduction
- Calendar component for selecting appointment times
- Form logic for new bookings and rescheduling
- API endpoints under `/api` implemented in C# (`BookingController`)
- Real‑time updates through SignalR
- Data stored in MySQL

Understanding these features is essential for replicating them in React.

## 2. New Architecture Overview

The repository now uses the following stack (see `README.md` for details):

- **React** front ends built with Vite (`frontend/site`)
- **NestJS** backend (`backend/`) exposing REST endpoints
- **Supabase** (PostgreSQL) as the shared database
- Node microservices for calendar, messaging and other automation

The migration should bring SiteOLD features into this structure while removing dependence on the old ASP.NET project.

## 3. Data Migration

1. Export existing lead and booking data from the MySQL database.
2. Load the schema in `database/postgres.sql` into Supabase using `database/load_supabase.sh`.
3. Import the exported data into the corresponding tables (`Leads`, `Booked`, etc.).
4. Verify that the Nest services can read the migrated data.

## 4. Backend API Implementation

Recreate the endpoints currently provided by `BookingController` in the Nest backend. Suggested routes:

- `GET /calendar/:realtorId/booked` – return booked slots
- `GET /booking/existing` – check if a phone already has a booking
- `POST /booking` – create or reschedule an appointment
- `GET /user` – look up a lead by tracking parameter
- `GET /realtor` – fetch realtor data by UUID

These endpoints should use Supabase and interact with the Calendar and Scheduler services when necessary.

## 5. React Front‑End Migration

1. Start from the existing React app in `frontend/site`.
2. Create components to replace the Razor views:
   - **VideoPlayer** – renders the realtor video.
   - **AppointmentCalendar** – shows available dates and times and submits bookings.
   - **BookingForm** – collects user information and handles rescheduling logic.
3. Use `fetch` or an HTTP client to call the new Nest endpoints listed above.
4. Replace SignalR with a WebSocket approach (e.g. Nest + Socket.IO) to update the calendar when a slot is booked.
5. Apply the styles from `SiteOLD` (tailwind classes, etc.) to the React components so the look and feel remain consistent.

## 6. Integration With Microservices

- When a booking is confirmed, call the Calendar microservice (`/create-event`) to create a Google Calendar entry.
- Use the Scheduler functionality in the Nest backend to queue SMS reminders in Supabase.
- The Messenger service handles Twilio SMS sending and logging.

## 7. Local Development Steps

1. Install dependencies at the repo root:
   ```bash
   npm install
   ```
2. Run the backend in development mode:
   ```bash
   npm run start:dev
   ```
3. In another terminal start the front end:
   ```bash
   cd frontend/site
   npm run dev
   ```
4. Access the page at `http://localhost:5173/<realtorUuid>/<userMarker>`.

Use `npm run master-switch` to start all services together when needed.

## 8. Deployment and Cleanup

- Configure environment variables as described in `docs/environment-variables.md` for production.
- Update any CI/CD or Docker scripts to build the React front end instead of the old ASP.NET project.
- Once feature parity is confirmed, remove the `SiteOLD` directory and obsolete C# code from the repository.

---

Following this plan will migrate the old ASP.NET application to the modern React and NestJS stack while keeping the overall booking and lead‑generation workflow intact.
