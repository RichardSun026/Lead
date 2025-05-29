import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { CalendarService, EventInput } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Post(':realtorId/events')
  @HttpCode(201)
  addEvent(@Param('realtorId') realtorId: number, @Body() body: EventInput) {
    return this.calendar.addEvent(realtorId, body);
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
}
