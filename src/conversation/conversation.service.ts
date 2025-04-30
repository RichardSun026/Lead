import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { StoredMessage } from './conversation.types';

@Injectable()
export class ConversationService {
  constructor(@InjectRedis() private readonly client: Redis) {}

  async store(userId: string, message: string, isAssistant = false) {
    const payload = { message, isAssistant };
    await this.client.rpush(`user:${userId}:messages`, JSON.stringify(payload));
    return payload;
  }

  async fetchAll(userId: string) {
    const items = await this.client.lrange(`user:${userId}:messages`, 0, -1);
    const parsed: StoredMessage[] = [];

    for (let i = 0; i < items.length; i++) {
      const msg = JSON.parse(items[i]) as StoredMessage;
      parsed.push(msg);
    }
    return parsed;
  }
}
