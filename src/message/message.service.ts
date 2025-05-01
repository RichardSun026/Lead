import { Injectable } from '@nestjs/common';
import { ConversationService } from '../clientRedis/conversation.service';
import { WeekDay } from '../clientRedis/conversation.types';
import { PromptService } from '../agent/prompt.service';
import { OpenAiService } from '../agent/openai.service';
import OpenAI from 'openai';

@Injectable()
export class MessageService {
  constructor(
    private readonly conversation: ConversationService,
    private readonly prompt: PromptService,
    private readonly openai: OpenAiService,
  ) {}

  async send(userId: string, userMsg: string) {
    // 1) user message --> Redis
    await this.conversation.store(userId, userMsg);

    // 2) full history
    const history = await this.conversation.fetchAll(userId);

    // 3) convert --> OpenAI format
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    messages.push({
      role: 'system',
      content: this.prompt.systemMessage(),
    });

    for (const msg of history) {
      messages.push({
        role: msg.isAssistant ? 'assistant' : 'user',
        content: msg.message,
      });
    }
    // 4) call agent
    const reply = await this.agentLoop(messages, userId);

    // 5) assistant reply --> Redis
    await this.conversation.store(userId, reply, true);

    return reply;
  }

  async agentLoop(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    userId: string,
  ): Promise<string> {
    let turn: number = 0;
    console.log('\n-\n-\n-\n-');
    while (true) {
      turn += 1;
      const reply = await this.openai.chat(messages);

      messages.push({
        role: 'assistant',
        content: reply.content ?? '',
        tool_calls: reply.tool_calls,
      });

      console.log(
        ` - assistant turn ${turn}> \n`,
        JSON.stringify(reply, null, 2),
        '\n:\n:\n:\n:',
      );
      if (!reply.tool_calls) {
        return reply.content ?? '';
      }

      for (const call of reply.tool_calls) {
        const { name } = call.function;
        const args: unknown = JSON.parse(call.function.arguments);
        let result: unknown;

        if (name == 'set_user_plan') {
          const { week_day, plan } = args as {
            week_day: WeekDay;
            plan: string;
          };
          console.log('set_user_plan', week_day);
          await this.conversation.setPlanDay(userId, week_day, plan);
          result = 'ok';
        } else if (name == 'get_user_plan') {
          const { week_day } = args as { week_day: WeekDay };
          console.log('get_user_plan', week_day);
          result = await this.conversation.getPlanDay(userId, week_day);
        } else if (name == 'search_web') {
          const { query } = args as { query: string };
          console.log('search_web', query);
          result = await this.openai.search(query);
        } else {
          result = { error: `Tool ${name} not implemented` };
        }

        console.log(
          '\nrole: tool',
          `\ntool_call_id: ${call.id}`,
          `\ncontent: ${typeof result === 'string' ? result : JSON.stringify(result)}`,
        );

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      }
    }
  }
}
