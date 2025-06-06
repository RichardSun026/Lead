import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { MessengerService } from '../messenger/messenger.service';
import { CalendarService } from '../calendar/calendar.service';
import { DateTime } from 'luxon';

/* eslint-disable @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access */

export interface BookingInput {
  phone: string;
  full_name: string;
  booked_date: string; // YYYY-MM-DD
  booked_time: string; // HH:mm
  time_zone: string;
  realtor_id: number;
}

@Injectable()
export class BookingService {
  private readonly supabase: SupabaseClient<any>;

  constructor(
    private readonly messenger: MessengerService,
    private readonly calendar: CalendarService,
  ) {
    this.supabase = createClient<any>(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );
  }

  async getExisting(phone: string) {
    const { data } = await this.supabase
      .from('booked')
      .select('appointment_time')
      .eq('phone', phone)
      .maybeSingle();
    if (!data) return null;
    const iso = data.appointment_time as string;
    const dt = DateTime.fromISO(iso);
    return {
      date: dt.toISODate(),
      time: dt.toFormat('HH:mm'),
    };
  }

  async createOrUpdate(input: BookingInput) {
    const existing = await this.getExisting(input.phone);
    const start = DateTime.fromISO(
      `${input.booked_date}T${input.booked_time}`,
      {
        zone: input.time_zone,
      },
    );
    const end = start.plus({ minutes: 30 });

    await this.calendar.addEvent(input.realtor_id, {
      summary: `Meeting with ${input.full_name}`,
      description: `Phone: ${input.phone}`,
      start: start.toISO(),
      end: end.toISO(),
      calendarId: 'primary',
      phone: input.phone,
    });

    await this.supabase.from('booked').upsert({
      phone: input.phone,
      name: input.full_name,
      appointment_time: start.toISO(),
      realtor_id: input.realtor_id,
    });

    const msg = `Thanks ${input.full_name}, your appointment is confirmed for ${start.toISO()}.`;
    await this.messenger.sendSms(input.phone, msg);
    return { wasRebooking: !!existing };
  }
}
