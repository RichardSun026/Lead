import { Injectable } from '@nestjs/common';
import { ConversationService } from '../clientRedis/conversation.service';
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
    const { reply, debug } = await this.agentLoop(messages, userId);

    // 5) assistant reply --> Redis
    await this.conversation.store(userId, reply, true);

    return debug;
  }

  async agentLoop(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    userId: string,
  ): Promise<{ reply: string; debug: string }> {
    const debug: string[] = [];
    let turn: number = 0;
    while (true) {
      turn += 1;
      const reply = await this.openai.chat(messages);
      debug.push(
        ` - assistant turn ${turn}> ` + JSON.stringify(reply, null, 2),
      );
      if (!reply.tool_calls) {
        return { reply: reply.content ?? '', debug: debug.join('\n') };
      }

      for (const call of reply.tool_calls) {
        const { name } = call.function;
        const args = JSON.parse(call.function.arguments);
        let result: unknown;

        if (name === 'set_user_plan') {
          const { week_day, plan } = args;
          await this.conversation.setPlanDay(userId, week_day, plan);
        } else if (name === 'get_user_plan') {
          const { week_day } = args;
          result = await this.conversation.getPlanDay(userId, week_day);
        } else {
          result = { error: `Tool ${name} not implemented` };
        }

        debug.push(
          `${name}(${JSON.stringify(args)}) --> ${JSON.stringify(result)}`,
        );

        messages.push({
          role: 'tool', //or 'function'
          tool_call_id: call.id,
          // name: name,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      }
    }
  }
}
