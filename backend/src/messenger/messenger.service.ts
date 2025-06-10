import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from '../twilio/twilio.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConversationService } from '../clientRedis/conversation.service';

@Injectable()
export class MessengerService {
  private readonly log = new Logger('MessengerService');
  private readonly supabase: SupabaseClient<any>;

  constructor(
    private readonly conversation: ConversationService,
    private readonly twilio: TwilioService,
  ) {
    this.supabase = createClient<any>(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );
  }

  async sendSms(
    phone: string,
    text: string,
    storeMessage = true,
  ): Promise<void> {
    try {
      await this.twilio.sendWhatsApp(phone, text);
      await this.supabase.from('message_logs').insert({
        phone,
        message_type: 'text',
        message_text: text,
        status: 'sent',
      });
      if (storeMessage) {
        await this.conversation.store(phone, { role: 'assistant', content: text });
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
        await this.conversation.store(phone, { role: 'assistant', content: text });
      }
    }
  }
}
