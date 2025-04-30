import { Injectable } from '@nestjs/common';
import { ConversationService } from '../conversation/conversation.service';
import { OpenAiService } from '../openai/openai.service';
import OpenAI from 'openai';

@Injectable()
export class MessageService {
  constructor(
    private readonly conversation: ConversationService,
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
      content: 'You are FitCoachAI, a helpful fitness coach.',
    });

    for (const msg of history) {
      messages.push({
        role: msg.isAssistant ? 'assistant' : 'user',
        content: msg.message,
      });
    }

    // 4) call GPT
    const assistant = await this.openai.chat(messages);

    // 5) assistant reply --> Redis
    await this.conversation.store(userId, assistant, true);

    return assistant;
  }
}
