import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from '../twilio/twilio.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConversationService } from '../clientRedis/conversation.service';

const TEMPLATE_TEXT: Record<string, string> = {
  '[template:opt_in_pt]':
    'Olá {{name}},\nobrigado por dedicar seu tempo para preencher a pesquisa de avaliação de imóvel. Para ajudar a refinar sua estimativa, gostaria de fazer algumas perguntas rápidas.\n\n\nVocê poderia me contar um pouco sobre quaisquer atualizações ou melhorias recentes que tenha feito na propriedade? Coisas como reforma da cozinha, telhado novo ou piso atualizado podem influenciar bastante o valor.',
};
@Injectable()
export class MessengerService {
  private readonly log = new Logger('MessengerService');
  private readonly supabase: SupabaseClient<any>;
  private readonly limit = Number(process.env.MESSAGE_LIMIT ?? '10');

  constructor(
    private readonly conversation: ConversationService,
    private readonly twilio: TwilioService,
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
            content: TEMPLATE_TEXT[text] ?? text,
          });
        }
        return;
      }

      await this.twilio.sendWhatsApp(phone, text);
      await this.supabase.from('message_logs').insert({
        phone,
        message_type: 'text',
        message_text: text,
        status: 'sent',
      });
      if (storeMessage) {
        await this.conversation.store(phone, {
          role: 'assistant',
          content: TEMPLATE_TEXT[text] ?? text,
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
          content: TEMPLATE_TEXT[text] ?? text,
        });
      }
    }
  }
}
