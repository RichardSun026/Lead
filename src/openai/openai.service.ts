import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async chat(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
  ): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
    });
    return res.choices[0].message.content ?? '';
  }
}
