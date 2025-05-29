import { Body, Controller, Get, Post } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface BookPayload {
  phone: string;
  fullName: string;
  date: string;
  time: string;
  timeZone?: string;
  realtorId: number;
}

@Controller()
export class SiteController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  landing(): string {
    return '<html><body><h1>Welcome</h1><video controls src="video.mp4"></video></body></html>';
  }

  @Post('book')
  async book(@Body() payload: BookPayload) {
    await this.supabase.insert('Booked', {
      phone: payload.phone,
      full_name: payload.fullName,
      booked_date: payload.date,
      booked_time: payload.time,
      time_zone: payload.timeZone ?? 'UTC',
      realtor_id: payload.realtorId,
    });

    await this.supabase.remove('scheduled_messages', { phone: payload.phone });
    return { status: 'booked' };
  }
}
