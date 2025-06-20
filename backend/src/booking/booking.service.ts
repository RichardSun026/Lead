import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { MessengerService } from '../messenger/messenger.service';
import { CalendarService } from '../calendar/calendar.service';
import { DateTime } from 'luxon';
import { normalizePhone } from '../utils/phone';

export interface BookingInput {
  phone: string;
  full_name: string;
  booked_date: string; // YYYY-MM-DD
  booked_time: string; // HH:mm
  time_zone: string;
  realtor_id: string;
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
    const sanitized = normalizePhone(phone);
    const { data } = await this.supabase
      .from('bookings')
      .select('appointment_time')
      .eq('phone', sanitized)
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
    const phone = normalizePhone(input.phone);
    const existing = await this.getExisting(phone);
    const start = DateTime.fromISO(
      `${input.booked_date}T${input.booked_time}`,
      {
        zone: input.time_zone,
      },
    );
    const end = start.plus({ minutes: 30 });
    const startIso = start.toISO();
    const endIso = end.toISO();
    if (!startIso || !endIso) throw new Error('Invalid booking time');

    const day = start.toISODate();
    const openings = await this.calendar.getBookedSlots(
      input.realtor_id,
      day ?? input.booked_date,
    );
    if (openings.booked.includes(start.toFormat('HH:mm')))
      throw new Error('Time slot already booked');

    await this.calendar.addEvent(input.realtor_id, {
      summary: `Meeting with ${input.full_name}`,
      description: `Phone: ${phone}`,
      start: startIso,
      end: endIso,
      calendarId: 'primary',
      phone,
    });

    await this.supabase.from('bookings').upsert({
      phone,
      name: input.full_name,
      appointment_time: start.toISO(),
      realtor_id: input.realtor_id,
    });

    const msg = `Thanks ${input.full_name}, your appointment is confirmed for ${start.toISO()}.`;
    await this.messenger.sendSms(phone, msg);
    return { wasRebooking: !!existing };
  }
}
