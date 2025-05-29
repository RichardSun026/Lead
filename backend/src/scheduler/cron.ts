/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { createClient } from '@supabase/supabase-js';
import { Twilio } from 'twilio';

const supabase = createClient<any>(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
);

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID ?? '',
  process.env.TWILIO_AUTH_TOKEN ?? '',
);
const FROM = process.env.TWILIO_PHONE_NUMBER ?? '';

export async function handler(): Promise<void> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('message_status', 'pending')
    .lte('scheduled_time', now);

  if (error) {
    console.error('Fetch error', error);
    return;
  }

  for (const row of (data ?? []) as any[]) {
    try {
      await twilio.messages.create({
        body: row.message_text ?? '',
        to: row.phone,
        from: FROM,
      });
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'sent' })
        .eq('id', row.id);
    } catch (err) {
      console.error('Send failed', err);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'failed' })
        .eq('id', row.id);
    }
  }
}

if (require.main === module) {
  void handler().then(() => process.exit());
}
