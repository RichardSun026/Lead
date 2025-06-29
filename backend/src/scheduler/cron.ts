import { createClient } from '@supabase/supabase-js';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import Redis from 'ioredis';

const supabase = createClient<any>(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
);

const whatsapp = new WhatsAppService();
const redis = new Redis(process.env.REDIS_URL ?? '');
const LIST = (phone: string) => `phone:${phone}:json`;

function optInPtText(name: string): string {
  return `Olá ${name},\nobrigado por dedicar seu tempo para preencher a pesquisa de avaliação de imóvel. Para ajudar a refinar sua estimativa, gostaria de fazer algumas perguntas rápidas.\n\nVocê poderia me contar um pouco sobre quaisquer atualizações ou melhorias recentes que tenha feito na propriedade? Coisas como reforma da cozinha, telhado novo ou piso atualizado podem influenciar bastante o valor.`;
}

function isRow(
  row: unknown,
): row is {
  id: number;
  phone: string;
  message_text?: string | null;
  message_type?: string | null;
} {
  return (
    typeof row === 'object' && row !== null && 'id' in row && 'phone' in row
  );
}

export async function handler(): Promise<void> {
  const now = new Date().toISOString();
  console.log(`cron.ts executing at ${now}`);
  const { data, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('message_status', 'pending')
    .lte('scheduled_time', now);

  if (error) {
    console.error('Fetch error', error);
    return;
  }

  console.log(`Found ${data?.length ?? 0} pending messages`);

  for (const raw of data ?? []) {
    if (!isRow(raw)) {
      console.warn('Skipping malformed row');
      continue;
    }
    try {
      if (raw.message_type === 'template' && raw.message_text) {
        const t = JSON.parse(raw.message_text);
        await whatsapp.sendTemplate(raw.phone, t.name, t.language, t.components);
      } else {
        await whatsapp.sendMessage(raw.phone, raw.message_text ?? '');
      }
      console.log(`Sent message ${raw.id} to ${raw.phone}`);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'sent' })
        .eq('id', raw.id);
      await redis.rpush(
        LIST(raw.phone),
        JSON.stringify({
          role: 'assistant',
          content:
            raw.message_type === 'template'
              ? (() => {
                  const t = JSON.parse(raw.message_text ?? '{}');
                  if (t.name === 'opt_in_pt') {
                    const comps = t.components ?? [];
                    let userName = '{{name}}';
                    const header = Array.isArray(comps)
                      ? comps.find((c: any) => c && c.type === 'HEADER')
                      : undefined;
                    if (header && Array.isArray((header as any).parameters)) {
                      const param = (header as any).parameters.find(
                        (p: any) => p && p.type === 'TEXT' && typeof p.text === 'string',
                      );
                      if (param) userName = param.text;
                    }
                    return optInPtText(userName);
                  }
                  return `[template:${t.name}]`;
                })()
              : raw.message_text ?? '',
        }),
      );
    } catch (err) {
      console.error(`Send failed for ${raw.id}`, err);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'failed' })
        .eq('id', raw.id);
      await redis.rpush(
        LIST(raw.phone),
        JSON.stringify({
          role: 'assistant',
          content:
            raw.message_type === 'template'
              ? (() => {
                  const t = JSON.parse(raw.message_text ?? '{}');
                  if (t.name === 'opt_in_pt') {
                    const comps = t.components ?? [];
                    let userName = '{{name}}';
                    const header = Array.isArray(comps)
                      ? comps.find((c: any) => c && c.type === 'HEADER')
                      : undefined;
                    if (header && Array.isArray((header as any).parameters)) {
                      const param = (header as any).parameters.find(
                        (p: any) => p && p.type === 'TEXT' && typeof p.text === 'string',
                      );
                      if (param) userName = param.text;
                    }
                    return optInPtText(userName);
                  }
                  return `[template:${t.name}]`;
                })()
              : raw.message_text ?? '',
        }),
      );
    }
  }

  console.log('cron.ts run complete');
}

if (require.main === module) {
  void handler().then(() => process.exit());
}
