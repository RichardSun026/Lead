/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
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

  async cancelMessages(phone: string): Promise<void> {
    await this.client
      .from('scheduled_messages')
      .update({ message_status: 'canceled' })
      .eq('phone', phone)
      .eq('message_status', 'pending');
  }
}
