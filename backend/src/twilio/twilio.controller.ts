import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AgentService } from '../agentLogic/agent.service';
import { LeadsService } from '../leads/leads.service';

@Controller('webhook')
export class TwilioController {
  private readonly log = new Logger('TwilioWebhook');

  constructor(
    private readonly agent: AgentService,
    private readonly leads: LeadsService,
  ) {}

  @Post('twilio')
  async handleWebhook(@Body() body: Record<string, unknown>) {
    this.log.log(`Received Twilio webhook: ${JSON.stringify(body)}`);
    const from = typeof body.From === 'string' ? body.From : undefined;
    const message = typeof body.Body === 'string' ? body.Body : undefined;
    if (typeof from === 'string' && typeof message === 'string') {
      const phone = from.replace(/^whatsapp:/, '');
      await this.leads.markHotIfCold(phone);
      await this.agent.send(phone, message);
    } else {
      this.log.warn('Invalid webhook payload');
    }
    return { status: 'ok' };
  }
}
