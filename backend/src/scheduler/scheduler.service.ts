import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { MessengerService } from '../messenger/messenger.service';

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly client: SupabaseClient<any>;
  private interval?: NodeJS.Timeout;
  private readonly log = new Logger('SchedulerService');

  private isRow(row: unknown): row is {
    id: number;
    phone: string;
    message_text?: string | null;
  } {
    return (
      typeof row === 'object' && row !== null && 'id' in row && 'phone' in row
    );
  }

  constructor(private readonly messenger: MessengerService) {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
  }

  async scheduleMessage(
    phone: string,
    time: string,
    content: string,
  ): Promise<void> {
    const { data: lead, error } = await this.client
      .from('leads')
      .select('realtor_id')
      .eq('phone', phone)
      .maybeSingle();

    if (error) throw error;
    const realtorId = (lead as { realtor_id: number } | null)?.realtor_id;
    if (!realtorId) throw new Error('Invalid phone number');

    await this.client.from('scheduled_messages').insert({
      phone,
      realtor_id: realtorId,
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

  async processDueMessages(): Promise<void> {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('scheduled_messages')
      .select('*')
      .eq('message_status', 'pending')
      .lte('scheduled_time', now);

    if (error) {
      this.log.error('Fetch error', error as Error);
      return;
    }

    for (const raw of data ?? []) {
      if (!this.isRow(raw)) {
        this.log.warn('Skipping malformed row');
        continue;
      }
      try {
        await this.messenger.sendSms(raw.phone, raw.message_text ?? '');
        await this.client
          .from('scheduled_messages')
          .update({ message_status: 'sent' })
          .eq('id', raw.id);
        this.log.log(`Sent message ${raw.id} to ${raw.phone}`);
      } catch (err) {
        this.log.error(`Send failed for ${raw.id}`, err as Error);
        await this.client
          .from('scheduled_messages')
          .update({ message_status: 'failed' })
          .eq('id', raw.id);
      }
    }
  }

  onModuleInit(): void {
    const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS ?? '60000');
    this.log.log(`Starting scheduler cron every ${intervalMs}ms`);
    this.interval = setInterval(() => {
      void this.processDueMessages();
    }, intervalMs);
  }

  onModuleDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
