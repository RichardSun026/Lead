# Sending Test Messages

This guide explains how to manually trigger the messaging flow using `curl`.
It can be used to verify Twilio integration and the AI assistant's response.

## Prerequisites
- The backend server must be running. By default it listens on `http://localhost:3000`.
- Environment variables for Twilio and Supabase need to be configured in `backend/.env`.

## Example Request
Send a POST request to the `/message` endpoint with the target phone number and the message text:

```bash
curl -X POST http://134.199.198.237:3000/api/message \
  -H "Content-Type: application/json" \
  -d '{"phone": "+15551234567", "message": "Hello thank you for the message, yes i am instrested in selling my house"}'
```

The server replies with the assistant's message in JSON:

```json
{"assistant": "Thanks for reaching out!"}
```

A record is stored in the `message_logs` table and the conversation history is updated in Redis.
