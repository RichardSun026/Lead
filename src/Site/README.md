# Site

This module exposes the public landing page. It returns a simple HTML page with
an embedded video and accepts bookings via `POST /book`. Successful bookings are
stored in Supabase and any pending reminder messages for the phone number are
removed.

![How it should look](2025-05-29 at 13.30.14.png)