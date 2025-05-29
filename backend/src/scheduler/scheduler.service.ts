import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SchedulerService {
  private readonly client: SupabaseClient<any>;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
  }

  async scheduleMessage(
    phone: string,
    time: string,
    content: string,
  ): Promise<void> {
    await this.client.from('scheduled_messages').insert({
      phone,
      scheduled_time: time,
      message_type: 'text',
      message_text: content,
    });
  }

  async scheduleFollowUps(phone: string, appointment: string): Promise<void> {
    const eventTime = new Date(appointment);
    const offsets = [
      {
        ms: -24 * 60 * 60 * 1000,
        text: 'Reminder: your appointment is tomorrow.',
      },
      { ms: -60 * 60 * 1000, text: 'Reminder: your appointment is in 1 hour.' },
    ];
    await this.scheduleMessage(
      phone,
      new Date().toISOString(),
      `Thanks for booking! Your appointment is on ${eventTime.toISOString()}.`,
    );
    for (const o of offsets) {
      const when = new Date(eventTime.getTime() + o.ms).toISOString();
      await this.scheduleMessage(phone, when, o.text);
    }
  }

  async cancelMessages(phone: string): Promise<void> {
    await this.client
      .from('scheduled_messages')
      .update({ message_status: 'canceled' })
      .eq('phone', phone)
      .eq('message_status', 'pending');
  }
}
