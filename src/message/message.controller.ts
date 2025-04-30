import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(200)
  async send(@Body('userId') userId: string, @Body('message') message: string) {
    const assistant = await this.messageService.send(userId, message);
    return { assistant };
  }
}
