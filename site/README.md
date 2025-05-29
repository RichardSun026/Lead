# Site

This directory previously documented a basic ASP.NET implementation. In the
monorepo it now contains a React application located under
`apps/site`. The site shows a landing page with a calendar video and allows
users to book a time. Bookings are sent to the backend which stores them in
Supabase and clears any pending reminder messages from Redis.

![How it should look](../../InspirationForSite.png)

