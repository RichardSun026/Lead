import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from '../clientRedis/conversation.service';
import { PromptService } from '../agentHelp/prompt.service';
import { OpenAiService } from '../agentHelp/openai.service';
import OpenAI from 'openai';

@Injectable()
export class AgentService {
  private readonly log = new Logger('Agent');
  constructor(
    private readonly conversation: ConversationService,
    private readonly prompt: PromptService,
    private readonly openai: OpenAiService,
  ) {}

  async send(phone: string, userMsg: string, model = 'gpt-4o-mini'): Promise<string> {
    await this.conversation.store(phone, { role: 'user', content: userMsg });
    return this.agentLoop(phone, model);
  }

  private async agentLoop(phone: string, model: string): Promise<string> {
    const history = await this.conversation.fetchAll(phone);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.prompt.systemMessage() },
      ...history,
    ];

    const reply = await this.openai.chat(messages, model);
    await this.conversation.store(phone, reply);

    const calls = reply.tool_calls ?? [];
    if (calls.length === 0) {
      return reply.content ?? '';
    }

    for (const call of calls) {
      const { name } = call.function;
      const argsRaw = call.function.arguments ?? '{}';
      let args: unknown;
      try {
        args = JSON.parse(argsRaw);
      } catch {
        this.log.error(`Error parsing JSON for ${name}: ${argsRaw}`);
        args = {};
      }
      let result: unknown;
      switch (name) {
        case 'search_web':
          if (isSearchArgs(args)) {
            const { query } = args as { query: string };
            result = await this.openai.search(query);
          } else {
            result = { error: 'Missing or invalid { query: string }.' };
          }
          break;
        default:
          result = { error: `Tool ${name} not implemented` };
      }

      const toolMsg: OpenAI.Chat.ChatCompletionMessageParam = {
        role: 'tool',
        tool_call_id: call.id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      };
      await this.conversation.store(phone, toolMsg);
    }

    return this.agentLoop(phone, model);
  }
}

function isSearchArgs(args: unknown): args is { query: string } {
  return typeof args === 'object' && args !== null && typeof (args as any).query === 'string';
}
