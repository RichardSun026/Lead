import { Controller, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { WeekDay, WeekPlan } from './conversation.types';

@Controller('weekplan')
export class WeekPlanController {
  constructor(private readonly conversation: ConversationService) {}

  @Get(':userId')
  async getWeekPlan(@Param('userId') userId: string): Promise<WeekPlan> {
    const days: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const plan: WeekPlan = {
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
    };
    console.log(`HERE`);
    for (const day of days) {
      plan[day] = await this.conversation.getPlanDay(userId, day);
      console.log(`Day: ${day}, Plan: ${plan[day]}`);
    }
    return plan;
  }
}
