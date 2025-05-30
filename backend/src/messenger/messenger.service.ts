import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class MessengerService {
  private readonly log = new Logger('MessengerService');
  private readonly twilio: Twilio;
  private readonly from: string;
  private readonly supabase: SupabaseClient<any>;

  constructor() {
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID ?? '',
      process.env.TWILIO_AUTH_TOKEN ?? '',
    );
    this.from = process.env.TWILIO_PHONE_NUMBER ?? '';
    this.supabase = createClient<any>(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );
  }

  async sendSms(phone: string, text: string): Promise<void> {
    try {
      await this.twilio.messages.create({
        body: text,
        to: phone,
        from: this.from,
      });
      await this.supabase.from('message_logs').insert({
        phone,
        message_type: 'text',
        message_text: text,
        status: 'sent',
      });
    } catch (err) {
      this.log.error('Failed to send SMS', err as Error);
      await this.supabase.from('message_logs').insert({
        phone,
        message_type: 'text',
        message_text: text,
        status: 'failed',
      });
    }
  }
}
