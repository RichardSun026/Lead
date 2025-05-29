import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type ChatCompletionTool = NonNullable<
  OpenAI.Chat.ChatCompletionCreateParams['tools']
>[number];

@Injectable()
export class PromptService {
  systemMessage(): string {
    return `be helpful, concise, and accurate.`;
  }

  searchSystemMessage(): string {
    return `Provide a summary of the search results.`;
  }

  tools(): ChatCompletionTool[] {
    return [this.search_web_tool()];
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
}
