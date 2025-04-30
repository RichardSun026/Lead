import { Injectable } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';
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
    const reply = await this.agentLoop(messages);

    // 5) assistant reply --> Redis
    await this.conversation.store(userId, reply, true);

    return reply;
  }

  async agentLoop(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ): Promise<string> {
    const builder: string = '';

    while (true) {
      const reply = await this.openai.chat(messages);

      if (!reply.tool_calls || reply.tool_calls.length === 0) {
        return builder;
      }
    }
  }
}
