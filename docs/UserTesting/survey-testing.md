# Testing the Survey with cURL

The survey front‑end normally posts answers to the Nest backend at `https://www.myrealvaluation.com/api`. For quick testing you can mimic this step without a browser by sending the JSON payloads directly.

## Create a Lead

Use `POST /api/leads` to store the survey answers and contact info. Every field is optional except `name`, `phone` and `realtorId`.

```bash
curl -X POST http://134.199.198.237:3000/api/leads \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Tester",
    "phone": "+5511998966766",
    "email": "jane@example.com",
    "realtorId": "f957761b-104e-416e-a550-25e010ca9302",
    "zipcode": "90210",
    "timeZone": "America/Chicago",
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

## Schedule a Follow‑up Message (optional)

To replicate the reminder WhatsApp message that the survey normally triggers, call `POST /api/schedule` with the phone number, ISO timestamp and message text:

```bash
curl -X POST http://134.199.198.237:3000/api/schedule \
  -H 'Content-Type: application/json' \
  --data-raw '{"phone":"+16505752132","time":"2025-06-09T18:18:17Z","content":"Hi Jane Tester, thanks for taking the time to fill out the home valuation survey. To help refine your estimate, I would like to ask a couple of quick questions.\n\nCould you tell me about any recent updates or improvements you have made to the property? Things like kitchen remodels, new roofing, or updated flooring can really influence value."}'
```

This queues the message in Supabase and the Scheduler service will deliver it at the specified time.

These requests allow you to verify the survey workflow without opening the website.
