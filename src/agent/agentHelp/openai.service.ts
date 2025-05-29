import { Injectable } from '@nestjs/common';
import { PromptService } from './prompt.service';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly client: OpenAI;
  constructor(private readonly prompt: PromptService) {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async chat(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    model: string,
  ): Promise<OpenAI.Chat.ChatCompletionMessage> {
    const res = await this.client.chat.completions.create({
      model,
      messages,
      tools: this.prompt.tools(),
    });
    return res.choices[0].message;
  }
  async search(query: string): Promise<string> {
    //TODO: add error handling
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    messages.push({
      role: 'system',
      content: this.prompt.searchSystemMessage(),
    });
    messages.push({
      role: 'user',
      content: query,
    });
    const res = await this.client.chat.completions.create({
      model: 'gpt-4o-search-preview',
      messages,
    });
    return res.choices[0].message.content ?? '';
  }
}
