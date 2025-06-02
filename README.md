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
3. Start all services together with the master switch:
   ```bash
npm run master-switch
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

When running the landing page, navigate to `http://localhost:5173/<realtorUUID>`.
The user marker portion of the URL is optional and no longer required. The page fetches the
realtor's video and calendar using the UUID provided in the URL.

See the [docs directory](docs/README.md) for additional notes such as the database schema and sample scripts.

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






















