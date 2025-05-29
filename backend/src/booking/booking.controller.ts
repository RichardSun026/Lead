import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BookingInput, BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookings: BookingService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() body: BookingInput) {
    await this.bookings.createBooking(body);
    return { status: 'booked' };
  }
}
