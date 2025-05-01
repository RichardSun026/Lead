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
    model: string = 'gpt-4.1-mini',
  ): Promise<OpenAI.Chat.ChatCompletionMessage> {
    const res = await this.client.chat.completions.create({
      model: model,
      messages,
      tools: this.prompt.tools(),
    });
    return res.choices[0].message;
  }
}
