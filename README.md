npm install

export REDIS_URL='redis://redisURL:redisPort' e.g; 'redis://127.0.0.1:6379'
export OPENAI_API_KEY='sk-proj-...'

npm run build && npm run start:prod


### Stack

- **NestJS**
- **ioredis**
- **Redis**
- **OpenAI**

### Reasons

1. **NestJS** - scalable Node framework
2. **Redis as conversation memory** – Redis Cloud persists “user chat sessions (threads)… for a multi-tenant agent architecture,” proving it’s a fit for GenAI session state.
3. **OpenAI** - reflects the final project 

#### Sources

- Redis: https://medium.com/@kumarasinghe.it/scaling-nestjs-applications-with-bullmq-and-redis-a-deep-dive-into-background-job-processing-ce6b6fb5017f
- Redis sessions for chatbots: https://redis.com/blog/powering-langchain-opengpts-with-redis-cloud/
