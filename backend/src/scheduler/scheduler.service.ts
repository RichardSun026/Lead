import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { Twilio } from 'twilio';
import { ConversationService } from '../clientRedis/conversation.service';

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly client: SupabaseClient<any>;
  private readonly twilio: Twilio;
  private readonly from: string;
  private interval?: NodeJS.Timeout;
  private readonly log = new Logger('SchedulerService');

  constructor(private readonly conversation: ConversationService) {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID ?? '',
      process.env.TWILIO_AUTH_TOKEN ?? '',
    );
    this.from = process.env.TWILIO_PHONE_NUMBER ?? '';
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

    for (const row of data ?? []) {
      try {
        await this.twilio.messages.create({
          body: row.message_text ?? '',
          to: row.phone,
          from: this.from,
        });
        await this.client
          .from('scheduled_messages')
          .update({ message_status: 'sent' })
          .eq('id', row.id);
        this.log.log(`Sent message ${row.id} to ${row.phone}`);
        await this.conversation.store(row.phone, {
          role: 'assistant',
          content: row.message_text ?? '',
        });
      } catch (err) {
        this.log.error(`Send failed for ${row.id}`, err as Error);
        await this.client
          .from('scheduled_messages')
          .update({ message_status: 'failed' })
          .eq('id', row.id);
        await this.conversation.store(row.phone, {
          role: 'assistant',
          content: row.message_text ?? '',
        });
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
