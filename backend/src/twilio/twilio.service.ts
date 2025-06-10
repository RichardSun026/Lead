import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private readonly client: Twilio;
  private readonly from: string;
  private readonly log = new Logger('TwilioService');

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID ?? '',
      process.env.TWILIO_AUTH_TOKEN ?? '',
    );
    this.from = process.env.TWILIO_PHONE_NUMBER ?? '';
    if (!this.from) {
      this.log.error('TWILIO_PHONE_NUMBER environment variable is missing');
    }
  }

  async sendWhatsApp(to: string, body: string): Promise<void> {
    await this.client.messages.create({
      body,
      to: `whatsapp:${to}`,
      from: `whatsapp:${this.from}`,
    });
  }
}
