import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppTestController {
  constructor(private readonly whatsapp: WhatsAppService) {}

  @Post('test')
  @HttpCode(200)
  async sendTest(
    @Body('phone') phone: string,
    @Body('message') message: string,
  ) {
    await this.whatsapp.sendMessage(phone, message);
    return { status: 'attempted' };
  }
}
