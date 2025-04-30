import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { StoredMessage, WeekDay, WeekPlan } from './conversation.types';

const EMPTY_WEEK: WeekPlan = {
  mon: 'no workout today',
  tue: 'no workout today',
  wed: 'no workout today',
  thu: 'no workout today',
  fri: 'no workout today',
  sat: 'no workout today',
  sun: 'no workout today',
};

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

  private async ensurePlan(userId: string) {
    const key = `user:${userId}:plan`;
    const exists = await this.client.exists(key);
    if (!exists) await this.client.set(key, JSON.stringify(EMPTY_WEEK));
  }

  async getPlanDay(userId: string, day: WeekDay): Promise<string> {
    await this.ensurePlan(userId);
    const raw = await this.client.get(`user:${userId}:plan`);
    let plan: WeekPlan;
    if (raw) {
      plan = JSON.parse(raw) as WeekPlan;
      return plan[day];
    } else {
      return 'no workout today';
    }
  }

  async setPlanDay(
    userId: string,
    day: WeekDay,
    content: string,
  ): Promise<string> {
    await this.ensurePlan(userId);
    const key = `user:${userId}:plan`;
    const raw = await this.client.get(key);
    if (raw) {
      
    }
    const plan = JSON.parse(await this.client.get(key));
    plan[day] = content;
    await this.client.set(key, JSON.stringify(plan));
    return plan[day];
  }
}
