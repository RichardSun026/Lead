/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
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

  for (const row of data ?? []) {
    try {
      await twilio.messages.create({
        body: row.message_text ?? '',
        to: row.phone,
        from: FROM,
      });
      console.log(`Sent message ${row.id} to ${row.phone}`);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'sent' })
        .eq('id', row.id);
    } catch (err) {
      console.error(`Send failed for ${row.id}`, err);
      await supabase
        .from('scheduled_messages')
        .update({ message_status: 'failed' })
        .eq('id', row.id);
    }
  }

  console.log('cron.ts run complete');
}

if (require.main === module) {
  void handler().then(() => process.exit());
}
