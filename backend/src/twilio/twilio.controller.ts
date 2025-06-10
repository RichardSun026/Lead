import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AgentService } from '../agentLogic/agent.service';

@Controller('webhook')
export class TwilioController {
  private readonly log = new Logger('TwilioWebhook');

  constructor(private readonly agent: AgentService) {}

  @Post('twilio')
  async handleWebhook(@Body() body: Record<string, unknown>) {
    this.log.log(`Received Twilio webhook: ${JSON.stringify(body)}`);
    const from = typeof body.From === 'string' ? body.From : undefined;
    const message = typeof body.Body === 'string' ? body.Body : undefined;
    if (typeof from === 'string' && typeof message === 'string') {
      const phone = from.replace(/^whatsapp:/, '');
      await this.agent.send(phone, message);
    } else {
      this.log.warn('Invalid webhook payload');
    }
    return { status: 'ok' };
  }
}
