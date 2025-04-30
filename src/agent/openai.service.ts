import { Injectable } from '@nestjs/common';
import { PromptService } from './prompt.service';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  constructor(
    private readonly client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
    private readonly prompt: PromptService,
  ) {}

  async chat(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ): Promise<OpenAI.Chat.ChatCompletionMessage> {
    const res = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      tools: this.prompt.tools(),
    });
    return res.choices[0].message;
  }
}
