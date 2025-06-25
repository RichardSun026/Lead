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

function isRow(
  row: unknown,
): row is { id: number; phone: string; message_text?: string | null } {
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
      await whatsapp.sendMessage(raw.phone, raw.message_text ?? '');
      console.log(`Sent message ${raw.id} to ${raw.phone}`);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'sent' })
        .eq('id', raw.id);
      await redis.rpush(
        LIST(raw.phone),
        JSON.stringify({ role: 'assistant', content: raw.message_text ?? '' }),
      );
    } catch (err) {
      console.error(`Send failed for ${raw.id}`, err);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'failed' })
        .eq('id', raw.id);
      await redis.rpush(
        LIST(raw.phone),
        JSON.stringify({ role: 'assistant', content: raw.message_text ?? '' }),
      );
    }
  }

  console.log('cron.ts run complete');
}

if (require.main === module) {
  void handler().then(() => process.exit());
}
