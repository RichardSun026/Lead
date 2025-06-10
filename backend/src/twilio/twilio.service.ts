import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private readonly client: Twilio;
  private readonly from: string;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID ?? '',
      process.env.TWILIO_AUTH_TOKEN ?? '',
    );
    this.from = process.env.TWILIO_PHONE_NUMBER ?? '';
  }

  async sendWhatsApp(to: string, body: string): Promise<void> {
    await this.client.messages.create({
      body,
      to: `whatsapp:${to}`,
      from: `whatsapp:${this.from}`,
    });
  }
}
