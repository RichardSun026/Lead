// conversation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import OpenAI from 'openai';

const LIST = (phone: string) => `phone:${phone}:json`;

@Injectable()
export class ConversationService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /*---------------  STORE  ----------------*/
  async store(
    phone: string,
    payload: OpenAI.Chat.ChatCompletionMessageParam,
  ): Promise<void> {
    await this.redis.rpush(LIST(phone), JSON.stringify(payload));
  }

  /*---------------  FETCH (latest N)  ----------------*/
  async fetchAll(
    phone: string,
  ): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
    // newest item is at -1; grab up to <limit> going backwards
    const raw: string[] = await this.redis.lrange(LIST(phone), 0, -1);

    return raw
      .map((row) => {
        try {
          return JSON.parse(row) as OpenAI.Chat.ChatCompletionMessageParam;
        } catch {
          return undefined; // skip bad JSON silently
        }
      })
      .filter(
        (m): m is OpenAI.Chat.ChatCompletionMessageParam => m !== undefined,
      );
  }

  /*---------------  LENGTH  ----------------*/
  async length(phone: string): Promise<number> {
    return this.redis.llen(LIST(phone));
  }
}
