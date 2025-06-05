import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type ChatCompletionTool = NonNullable<
  OpenAI.Chat.ChatCompletionCreateParams['tools']
>[number];

@Injectable()
export class PromptService {
  systemMessage(followUp = false): string {
    if (followUp) {
      return `You are following up with a lead via SMS. Be concise and provide booking assistance.`;
    }
    return `be helpful, concise, and accurate.`;
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
            phone: { type: 'string' },
            full_name: { type: 'string' },
            booked_date: { type: 'string', description: 'YYYY-MM-DD' },
            booked_time: { type: 'string', description: 'HH:mm' },
            time_zone: { type: 'string' },
            realtor_id: { type: 'number' },
          },
          required: [
            'phone',
            'full_name',
            'booked_date',
            'booked_time',
            'time_zone',
            'realtor_id',
          ],
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
