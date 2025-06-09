# Testing the Survey with cURL

The survey front‑end normally posts answers to the Nest backend at `http://localhost:3000/api`. For quick testing you can mimic this step without a browser by sending the JSON payloads directly.

## Create a Lead

Use `POST /api/leads` to store the survey answers and contact info. Every field is optional except `name`, `phone` and `realtorUuid`.

```bash
curl -X POST http://localhost:3000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Tester",
    "phone": "+15551234567",
    "email": "jane@example.com",
    "realtorUuid": "YOUR-REALTOR-UUID",
    "zipcode": "90210",
    "homeType": "single-family",
    "bedrooms": "3",
    "bathrooms": "2",
    "sqft": "1500-1999",
    "yearBuilt": "1990-2010",
    "occupancy": "i-live",
    "timeframe": "within-3-months",
    "professional": "no",
    "expert": "yes"
  }'
```

Replace `YOUR-REALTOR-UUID` with the UUID of the target realtor. A successful request returns `{ "status": "ok" }`.

## Schedule a Follow‑up Message (optional)

To replicate the reminder SMS that the survey normally triggers, call `POST /api/schedule` with the phone number, ISO timestamp and message text:

```bash
curl -X POST http://localhost:3000/api/schedule \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "+15551234567",
    "time": "2024-01-01T12:00:00.000Z",
    "content": "Hi Jane, thanks for filling out the survey!"
  }'
```

This queues the message in Supabase and the Scheduler service will deliver it at the specified time.

These requests allow you to verify the survey workflow without opening the website.
