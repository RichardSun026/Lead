# Open Questions

The following points are unclear based on the current code and documentation. Clarification would help streamline development.

- The old `UserDataSite` has been replaced entirely by the React apps.
- Are standalone Node services (Messenger, Calendar, Scheduler) still used anywhere outside the Nest backend?
- How should time zones be handled when scheduling reminders and calendar events?
- Where should Google OAuth refresh tokens be stored in production?
- Are there plans for additional automated tests beyond the existing sample?
