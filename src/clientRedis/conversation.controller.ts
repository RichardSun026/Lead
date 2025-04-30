import { Controller, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversation: ConversationService) {}
  @Get(':userId')
  getAll(@Param('userId') userId: string) {
    return this.conversation.fetchAll(userId);
  }
}
