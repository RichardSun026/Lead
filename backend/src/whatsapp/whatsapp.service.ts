import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  private readonly log = new Logger('WhatsAppService');

  private readonly phoneNumberId = process.env.WA_PHONE_NUMBER_ID ?? '';

  private readonly token = process.env.WA_TOKEN ?? 'MRE_WhatsApp_5tkllkkjjuy5';

  async sendMessage(to: string, body: string): Promise<void> {
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
      throw new Error(`WhatsApp API error ${res.status}`);
    }
  }

  async sendToken(): Promise<string> {
    return this.token;
  }
}
