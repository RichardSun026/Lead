import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { MessengerService } from '../messenger/messenger.service';

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

  constructor(private readonly messenger: MessengerService) {
    this.supabase = createClient<any>(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );
  }

  async createBooking(input: BookingInput): Promise<void> {
    await this.supabase.from('Booked').insert({
      phone: input.phone,
      full_name: input.full_name,
      booked_date: input.booked_date,
      booked_time: input.booked_time,
      time_zone: input.time_zone,
      realtor_id: input.realtor_id,
    });

    const msg = `Thanks ${input.full_name}, your appointment is confirmed for ${input.booked_date} at ${input.booked_time} ${input.time_zone}.`;
    await this.messenger.sendSms(input.phone, msg);
  }
}
