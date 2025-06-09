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
2. Start the backend in development mode (optional):
   ```bash
npm run start:dev
```
3. Build and launch everything with the master switch. This compiles the backend
   and both React apps, then starts the backend server together with Vite preview
   servers for each site:
   ```bash
npm run master-switch
```

The landing page preview will be available at `http://localhost:4173` and the
survey site at `http://localhost:4174`.

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

When running the landing page in development mode, navigate to `http://localhost:5173/<realtorUUID>`. When using the master switch or `npm run preview`, open `http://localhost:4173` instead. The user marker portion of the URL is optional and no longer required. The page fetches the realtor's video and calendar using the UUID provided in the URL.

See the [docs directory](docs/README.md) for additional notes such as the database schema and sample scripts.

## User Experience Flow
The journey from survey to booking involves multiple services working together. A full walkthrough is available in [docs/survey-flow.md](docs/survey-flow.md). In short:

1. The survey stores answers in Supabase and Twilio, then either redirects the user to the booking site `[1a*]` or notifies them a realtor will follow up `[1b*]`.
2. On the site the user can book within five minutes `[2a*]` or receive scheduled reminders `[2b*]`.
3. Messaging features (book, see availability, stop) are handled through Twilio and OpenAI.


### Calendar Sync
The backend exposes `/calendar/:realtorId/events` to create and `/calendar/:realtorId/events/:eventId` to delete Google Calendar events.
Events are mirrored in Supabase tables `google_credentials` and `google_calendar_events`.

Planned improvements can be found in [TODO.md](TODO.md).






APPEND THIS:

````markdown
# Lead Project Architecture & Code Interrelationships

## Core Architecture Components

### 1. Front-End Services (Web Apps)

| Service        | Purpose                                                                 |
|----------------|-------------------------------------------------------------------------|
| **Site**       | Customer-facing landing page where users book appointments with realtors; features a video player and calendar integration. |
| **UserDataSite** | Retrieves user information via phone-number lookup. |

---

### 2. Back-End Logic Services (Micro-services)

| Service      | Key Responsibilities                                       |
|--------------|------------------------------------------------------------|
| **Messenger**  | Handles SMS via Twilio: send/receive messages and store logs. |
| **Scheduler**  | Manages follow-up SMS timing and automated message triggers. |
| **Calendar**   | Creates and manages appointment events via Google Calendar API. |
| **Intermediary** | Acts as a bridge between internal services and external APIs. |

---

### 3. Data Layer

**Supabase (PostgreSQL) schema**

| Table                | Purpose                                       |
|----------------------|-----------------------------------------------|
| `Realtor`            | Realtor profiles and contact info.            |
| `Leads`              | Captured lead details.                        |
| `Booked`             | Appointment-booking records.                  |
| `Messages`           | Message history and logs.                     |
| `scheduled_messages` | Queue of messages slated for future delivery. |

---

## Service Interrelationships

### Lead-Capture Flow

```mermaid
graph TD
  Site -->|store lead| DB[(Supabase)]
  Site -->|book| Calendar
  DB -->|trigger| Scheduler
````

### Communication Flow

```mermaid
graph TD
  Scheduler -->|deliver| Messenger
  Messenger -->|log| DB[(Supabase)]
  Messenger -->|invoke| Intermediary
  Intermediary -->|call| ExternalAPIs[(Twilio / OpenAI)]
```

---

### Integration Dependencies

* **Twilio** – SMS messaging
* **Google Calendar** – appointment scheduling
* **OpenAI** – message generation / processing
* **Facebook Forms** – lead-source ingestion

### Environment Configuration

All services share environment variables for:

* Database URLs and credentials
* API keys (Twilio, Google, OpenAI, etc.)
* Internal service endpoints

### Service-to-Service Communication

* **Microservice pattern**: each service owns a specific slice of business logic.
* Shared state lives in a **single Supabase database**.
* **Intermediary** functions as an API gateway for external integrations.
* Front-end services manage UI + direct DB access; back-end services handle automation and third-party calls.

---

**Bottom line:** This architecture delivers a full lead-management pipeline—from initial capture through booking and automated follow-ups—while cleanly separating user interfaces, business logic, and data storage.

```
```























## Docker Setup

To run the API, landing page, survey site and Redis locally using Docker compose:

```bash
docker-compose up --build
```

The services will be available at:

- API: <http://localhost:3000>
- Landing page: <http://localhost:4173>
- Survey site: <http://localhost:4174>
- Redis: localhost port 6379
