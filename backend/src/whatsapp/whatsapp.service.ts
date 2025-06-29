import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  private readonly log = new Logger('WhatsAppService');

  private readonly phoneNumberId = process.env.WA_PHONE_NUMBER_ID ?? '';

  private readonly token = process.env.WA_TOKEN ?? '';

  async sendMessage(to: string, body: string): Promise<void> {
    if (!this.phoneNumberId || !this.token) {
      this.log.warn('WhatsApp disabled: missing WA_PHONE_NUMBER_ID or WA_TOKEN');
      return;
    }
    const url = `https://graph.facebook.com/v23.0/${this.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      this.log.error(`Failed to send: ${text}`);
      try {
        const data = JSON.parse(text);
        const err = data?.error;
        if (err?.code === 133010 || err?.error_subcode === 2593006) {
          this.log.warn(
            'WhatsApp account not registered. Call /register API before sending messages.',
          );
          return;
        }
      } catch {
        // ignore JSON parse failures
      }
      throw new Error(`WhatsApp API error ${res.status}`);
    }
  }
}
