import { Controller, Post, Body, Param, HttpCode } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('schedule')
export class SchedulerController {
  constructor(private readonly scheduler: SchedulerService) {}

  @Post()
  @HttpCode(201)
  async schedule(
    @Body('time') time: string,
    @Body('phone') phone: string,
    @Body('content') content: string,
  ) {
    await this.scheduler.scheduleMessage(phone, time, content);
    return { status: 'scheduled' };
  }

  @Post('cancel/:phone')
  @HttpCode(200)
  async cancel(@Param('phone') phone: string) {
    await this.scheduler.cancelMessages(phone);
    return { status: 'canceled' };
  }
}
