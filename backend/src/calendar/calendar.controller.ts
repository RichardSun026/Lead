import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CalendarService, EventInput } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get('oauth/callback')
  @HttpCode(200)
  async oauthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const realtorId = Number(state);
    await this.calendar.handleOAuthCallback(code, realtorId);
    return { status: 'linked' };
  }

  @Get('oauth/:realtorId')
  getAuthUrl(@Param('realtorId') realtorId: number) {
    return { url: this.calendar.generateAuthUrl(realtorId) };
  }

  @Post(':realtorId/events')
  @HttpCode(201)
  addEvent(@Param('realtorId') realtorId: number, @Body() body: EventInput) {
    return this.calendar.addEvent(realtorId, body);
  }

  @Patch(':realtorId/events/:eventId')
  updateEvent(
    @Param('realtorId') realtorId: number,
    @Param('eventId') eventId: string,
    @Body() body: Partial<EventInput> & { calendarId: string },
  ) {
    const { calendarId, ...update } = body;
    return this.calendar.updateEvent(realtorId, calendarId, eventId, update);
  }

  @Delete(':realtorId/events/:eventId')
  @HttpCode(204)
  removeEvent(
    @Param('realtorId') realtorId: number,
    @Param('eventId') eventId: string,
    @Body('calendarId') calendarId: string,
  ) {
    return this.calendar.removeEvent(realtorId, calendarId, eventId);
  }

  @Get(':realtorId/booked')
  getBooked(
    @Param('realtorId') realtorId: number,
    @Query('date') date: string,
  ) {
    return this.calendar.getBookedSlots(realtorId, date);
  }

  @Get(':realtorId/openings')
  getOpen(@Param('realtorId') realtorId: number, @Query('date') date: string) {
    return this.calendar.getOpenSlots(realtorId, date);
  }
}
