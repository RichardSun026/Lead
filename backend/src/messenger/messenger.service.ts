import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConversationService } from '../clientRedis/conversation.service';

@Injectable()
export class MessengerService {
  private readonly log = new Logger('MessengerService');
  private readonly supabase: SupabaseClient<any>;
  private readonly limit = Number(process.env.MESSAGE_LIMIT ?? '10');

  constructor(
    private readonly conversation: ConversationService,
    private readonly whatsapp: WhatsAppService,
  ) {
    this.supabase = createClient<any>(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );
  }

  async countSent(phone: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('message_logs')
      .select('*', { count: 'exact', head: true })
      .eq('phone', phone)
      .eq('status', 'sent');
    if (error) {
      this.log.error('Failed to count messages', error as Error);
      return 0;
    }
    return count ?? 0;
  }

  async sendSms(
    phone: string,
    text: string,
    storeMessage = true,
  ): Promise<void> {
    try {
      const sentCount = await this.countSent(phone);
      if (sentCount >= this.limit) {
        this.log.warn(`Message limit reached for ${phone}`);
        if (storeMessage) {
          await this.conversation.store(phone, {
            role: 'assistant',
            content: text,
          });
        }
        return;
      }

      await this.whatsapp.sendMessage(phone, text);
      await this.supabase.from('message_logs').insert({
        phone,
        message_type: 'text',
        message_text: text,
        status: 'sent',
      });
      if (storeMessage) {
        await this.conversation.store(phone, {
          role: 'assistant',
          content: text,
        });
      }
    } catch (err) {
      this.log.error('Failed to send message', err as Error);
      await this.supabase.from('message_logs').insert({
        phone,
        message_type: 'text',
        message_text: text,
        status: 'failed',
      });
      if (storeMessage) {
        await this.conversation.store(phone, {
          role: 'assistant',
          content: text,
        });
      }
    }
  }
}
