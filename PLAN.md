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

## **src/conversation/***
**Explanation:**<br>this is responsible for sending the entire conversation back to the user, will occur when the user reloads the page.
### http route
```ts
@Controller('conversation')
class ConversationController {
    constructor(private readonly conversationService: ConversationService)
    @Get(':userId')
    getAll() {
        return this.conversationService.fetchAll(userId);
    }
}
```
### service
```ts
@Injectable()
class ConversationService {
  fetchAll(userId: string): JSON {
    `´`´look bellow`´`´
  }
}
```
```
valkey-cli keys *
valkey-cli LRANGE <enter list name> 0 -1
```
([Source](https://dev.to/aws/maintain-chat-history-in-generative-ai-apps-with-valkey-13p8))
```python
parsed = []
for s in items:
    parsed.append(json.loads(s))

return parsed
```
**outcome:** this should return the entier conversation to the user

## **src/message/***
**Explanation:**<br>this is responsible for reciving storing and responding the user
```ts
import OpenAI from "openai";

@Injectable()
class OpenAiService {
    const openai = new OpenAI(.env.OPENAI_KEY);

    chat(messages: JSON): string {
        const completion = await client.chat.completions.create({
            model: "gpt-4.1",
            messages: messages,
        });

        console.log(completion.choices[0].message.content);
        return completion.choices[0].message.content

    }
}
```

```python
# controler first recives the request
@app.post("/receive")
def receive_whatsapp_message():
    userID = request.form["userID"]
    body = request.form["Body"]

    # controler uses Services to store the message in Redis
    history = append_msg(userID, body, True) #automaticly also reads the entier database by asking ConversationController

    #builds conversation in a helper services
    messages = [{"role": "system", "content": .env.SYSTEM_MESSAGE}]
    for message in history:
        messages.append({"role": message["role"], "content": message["body"]})

    #this will also happen in some service
    reply = openAiService.chat(messages)
    # which will automaticly append the message
    append_msg(userID, reply, False) # false signify not user message
    replay(reply, ???)
    return Response(status=200)
```
**outcome:** this should return a message to the user created by the chatbot.