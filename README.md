## How to run?
*create redis db*
```bash
docker-compose up redis
```
*Install all dependencies*
```bash
npm install
```
*Export environment variables.*
```bash
export REDIS_URL='redis://redisURL:redisPort' e.g; 'redis://127.0.0.1:6379'
export OPENAI_API_KEY='sk-proj-...'
```
*Build/Run*
```bash
npm run build && npm run start:prod
```
**Heads-up (macOS/iCloud):** DO NOT clone this project inside a folder thats synced by iCloud Drive e.g; Desktop
## Example Usage
#### To see introduction
```bash
localhost:3000
```
#### To see a spesific conversation
```bash
localhost:3000/conversation/userId
```
*where userId is pram (i.e :userId)*
#### To see a spesific weekplan
```bash
localhost:3000/weekplan/userId
```
*where userId is pram (i.e :userId)*
#### To send a message to the chatbot.
```bash
curl -X POST http://localhost:3000/message \
  -H 'Content-Type: application/json' \
  -d '{"userId":"userId","message":"query"}'
```
*where userId and query is pram (i.e :userId and :body)*
## Stack

- **NestJS**
- **Redis**
- **OpenAI**

## Reasons

1. **NestJS** - scalable Node framework
2. **Redis as memory** – Redis persists user chat sessions and user plans.
3. **OpenAI** - reflects the final project 
   - **gpt-4.1-mini** – cost-effective; good at tool calling  
   - **gpt-4o-search-preview** – best for conducting internet search

### Sources

- Redis: https://medium.com/@kumarasinghe.it/scaling-nestjs-applications-with-bullmq-and-redis-a-deep-dive-into-background-job-processing-ce6b6fb5017f
- Redis sessions for chatbots: https://redis.com/blog/powering-langchain-opengpts-with-redis-cloud/
