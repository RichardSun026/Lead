# Testing the Survey with cURL

The survey front‑end normally posts answers to the Nest backend at `https://br.myrealvaluation.com/api`. For quick testing you can mimic this step without a browser by sending the JSON payloads directly.

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
    "sqft": "100-149",
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
  --data-raw '{"phone":"+5511999999999","time":"2025-06-09T18:18:17Z","content":"Olá Jane Tester, obrigado por dedicar seu tempo para preencher a pesquisa de avaliação de imóvel. Para ajudar a refinar sua estimativa, gostaria de fazer algumas perguntas rápidas.\n\nVocê poderia me contar um pouco sobre quaisquer atualizações ou melhorias recentes que tenha feito na propriedade? Coisas como reforma da cozinha, telhado novo ou piso atualizado podem influenciar bastante o valor."}'
```

This queues the message in Supabase and the Scheduler service will deliver it at the specified time.

These requests allow you to verify the survey workflow without opening the website.
