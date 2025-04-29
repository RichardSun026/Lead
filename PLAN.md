# FitCoachAI — Development Plan

## 1 Vision & Scope

FitCoachAI is a conversational fitness coach delivered through an **API**. It will generate personalised 7‑day training and supplementation plans while safely guiding users toward their fitness goals. The coach must be able to reason over a user’s context (equipment, constraints, health notes) and call auxiliary functions such as search or scheduling **within a single response**.

Responses will be streamed **token‑by‑token** to the client (Server‑Sent Events / WebSocket). *I have decided on streaming for a personal reason.*



## 2 Key Requirements
### FR
- Generate a *7‑day plan* adapted to the user’s goal, equipment, and schedule.
- Each day’s plan comprises: **training regimen**, **supplement stack**.
- Act as an **agent** that can chain multiple function calls in one reply (e.g., `getUserPlan`, `search`, `storePlan`).
- Invoke a **secondary LLM** dedicated to web search.
### NFR
- Use Redis database server side.
- Must create **≥ 3 automated tests**

## 3 Minimal UI
- On terminal have a small chat window that streams assistant text in real‑time, and shows the .


# Plan

src/conversation
```ts
@Controller('conversation')
class ConversationController {
    @Get(':userId')
    getAll() {
        self.fetchAll(userId); 
    }
}
```
