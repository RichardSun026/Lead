import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsAppService {
  private readonly log = new Logger('WhatsAppService');

  private readonly phoneNumberId = process.env.WA_PHONE_NUMBER_ID ?? '';

  private readonly token = process.env.WA_TOKEN ?? '';

  private registrationAttempted = false;

  private async registerPhoneIfNeeded(): Promise<void> {
    if (this.registrationAttempted || !this.phoneNumberId || !this.token) {
      return;
    }
    this.registrationAttempted = true;
    const url = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/register`;
    const payload = {
      messaging_product: 'whatsapp',
      pin: '654321',
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
      this.log.error(`WhatsApp registration failed: ${text}`);
    } else {
      this.log.log('WhatsApp phone number registered');
    }
  }

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
      let notRegistered = false;
      try {
        const data = JSON.parse(text);
        const err = data?.error;
        if (err?.code === 133010 || err?.error_subcode === 2593006) {
          notRegistered = true;
        }
      } catch {
        // ignore JSON parse failures
      }
      if (notRegistered) {
        const firstAttempt = !this.registrationAttempted;
        this.log.warn('WhatsApp account not registered. Attempting registration.');
        await this.registerPhoneIfNeeded();
        if (firstAttempt) {
          return this.sendMessage(to, body);
        }
        return;
      }
      throw new Error(`WhatsApp API error ${res.status}`);
    }
  }
}
