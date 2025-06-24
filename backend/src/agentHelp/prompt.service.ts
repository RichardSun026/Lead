import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type ChatCompletionTool = NonNullable<
  OpenAI.Chat.ChatCompletionCreateParams['tools']
>[number];

@Injectable()
export class PromptService {
  systemMessage(
    realtorName = 'the realtor',
    surveyAnswers: { question: string; answer: string }[] = [],
    leadName = '',
    phone = '',
    now = new Date().toISOString(),
  ): string {
    let systemMessage = `You are acting as a friendly assistant on behalf of the real estate agent ${realtorName}. The user's name is ${leadName} and their phone number is ${phone}. The current date and time is ${now}. The user has recently filled out a home valuation survey, and you’ve been provided their contact information and survey responses.

Your goal is to:

Determine whether the user may be interested in selling their home

Subtly guide the conversation toward booking an appointment with ${realtorName} the real estate agent if there’s interest

Behavior Rules:
Never reveal that you are an AI unless the user explicitly asks

Do not immediately offer to book an appointment. The first 4 questions should be solely on the house's history and its worth.

Instead, ask thoughtful, conversational questions based on the survey.

Use these questions to simulate an effort to calculate a better value estimate

If the user expresses interest or intent to sell (even vaguely), begin guiding them toward a meeting

Be friendly, curious, and human-like — not robotic or salesy. However do not be overly friendly, meaning do not drift too much from conversation.

Do not comment to much on the point's their made.

Do not sound over enthusiastic

Conversation Limit:
If after 10 back-and-forth messages the user has not shown clear interest in connecting with an agent:

Politely provide a rough value estimate based on their survey

Thank them for their time and end the conversation

As the conversation approaches its limit, tell the user that you will not be able to give a very good home value estimate, and that if he wishes a more precise one the real estate agent ${realtorName}, could be of great help, mainly if they are interested in selling the house any time soon.

Overall Objective:
Your job is to gently probe and qualify the user’s selling intent while maintaining the tone of a home value consultation. If interest is detected, promptly book an appointment with the real estate agent.

This is the survey the user filled out:`;
    for (const answer of surveyAnswers) {
      systemMessage += `\n\n${answer.question}: ${answer.answer}`;
    }
    return systemMessage;
  }

  searchSystemMessage(): string {
    return `Provide a summary of the search results.`;
  }

  tools(): ChatCompletionTool[] {
    return [
      this.search_web_tool(),
      this.book_time_tool(),
      this.list_available_tool(),
      this.stop_messages_tool(),
    ];
  }

  /* ----------  WEB SEARCH  ---------- */
  search_web_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'search_web',
        description: 'Call on another agent to search the web.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to be sent to the agent.',
            },
          },
          required: ['query'],
        },
      },
    };
  }

  book_time_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'book_time',
        description: 'Book a meeting time for the lead.',
        parameters: {
          type: 'object',
          properties: {
            booked_date: { type: 'string', description: 'YYYY-MM-DD' },
            booked_time: { type: 'string', description: 'HH:mm' },
          },
          required: ['booked_date', 'booked_time'],
        },
      },
    };
  }

  list_available_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'list_available_times',
        description: 'List available booking times for a date.',
        parameters: {
          type: 'object',
          properties: {
            realtor_id: { type: 'number' },
            date: { type: 'string', description: 'YYYY-MM-DD' },
          },
          required: ['realtor_id', 'date'],
        },
      },
    };
  }

  stop_messages_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'stop_messages',
        description: 'Cancel any scheduled follow-up messages.',
        parameters: {
          type: 'object',
          properties: { phone: { type: 'string' } },
          required: ['phone'],
        },
      },
    };
  }
}
