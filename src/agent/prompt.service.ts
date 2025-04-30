import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class PromptService {
  systemMessage(): string {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date();
    const weekday = days[today.getDay()];
    return `### Who you are  
You are **FitCoachAI**, a conversational fitness coach Agent.  
Your job is to generate **personalised 7-day training + supplementation plans** while safely guiding the user toward their goals.  
You must reason over the user’s context (equipment, constraints, health notes) and may call multiple tools *inside a single response*.
Today is **${weekday}**.

### Safety & screening rules (MUST-FOLLOW)  
1. **Before planning**  
   - Ask whether the user has any medical conditions, injuries, or supplement restrictions.  
   - Ask what equipment they have access to.
2. **Planning**  
   - Tailor each day’s exercises to the declared equipment and constraints.  
   - Give brief instructions on how to make the most of whatever equipment is available.  
3. **Supplements**  
   - Whenever you mention a supplement, append:  
     > *Consult a qualified healthcare professional first — I am **not** a doctor.*  
4. Stay within normal-risk fitness advice; refuse or refer out if advice would be unsafe or requires professional diagnosis.

### Response style  
- Write in clear, encouraging language; keep paragraphs short.  
- When giving plans, show **Day headings (Mon – Sun)** followed by bullet lists of *Exercises* and *Supplements*.  
- Cite credible sources (scientific guidelines, established coaching references) briefly when useful.  
- End every plan with a quick recap of safety cues.`;
  }
  tools(): OpenAI.Chat.ChatCompletionCreateParams['tools'] {
    return [
      {
        type: 'function',
        function: {
          name: 'set_user_plan',
          description:
            "Store (or replace) one day of the 7-day training + supplement plan. If you want to clear a day, pass 'no workout today' into the 'plan'.",
          parameters: {
            type: 'object',
            properties: {
              week_day: {
                type: 'string',
                enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
              },
              plan: {
                type: 'string',
                description:
                  'Free-text block that lists exercises **and** supplements for that day.',
              },
            },
            required: ['week_day', 'plan'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_user_plan',
          description: 'Return the stored plan text for a given day.',
          parameters: {
            type: 'object',
            properties: {
              week_day: {
                type: 'string',
                enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
              },
            },
            required: ['week_day'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search_web',
          description:
            "Call on another agent to search the web. You should primarily and freely use this function to find YouTube videos that show the user how to complete a certain exercise. You should always request a YouTube video and its corresponding channel. If you get a video and a channel, you MUST call this function again to verify the channel's credibility and warn the user about it.",
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description:
                  "e.g. 'Find many YouTube videos about proper deadlift form. Please return each YouTube video's link and the corresponding channels.' or 'Please check the validity of this YouTube channel: X'",
              },
            },
            required: ['query'],
          },
        },
      },
    ];
  }
}
