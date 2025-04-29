### Stack

- **NestJS**
- **BullMQ**
- **Redis**
- **OpenAI**

### Reasons

1. **NestJS** - scalable Node framework
2. **BullMQ + Redis for background jobs** – shown to “handle background jobs efficiently” in a NestJS app, keeping the HTTP path fast.
3. **Redis as conversation memory** – Redis Cloud persists “user chat sessions (threads)… for a multi-tenant agent architecture,” proving it’s a fit for GenAI session state.
4. **OpenAI** - rects the final project 

#### Source Links

- BullMQ + Redis: https://medium.com/@kumarasinghe.it/scaling-nestjs-applications-with-bullmq-and-redis-a-deep-dive-into-background-job-processing-ce6b6fb5017f
- Redis sessions for chatbots: https://redis.com/blog/powering-langchain-opengpts-with-redis-cloud/
