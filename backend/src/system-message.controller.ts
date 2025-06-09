import { Controller, Get, Param } from '@nestjs/common';
import { PromptService } from './agentHelp/prompt.service';
import { LeadsService } from './leads/leads.service';

@Controller('systemmessage')
export class SystemMessageController {
  constructor(
    private readonly prompt: PromptService,
    private readonly leads: LeadsService,
  ) {}

  @Get(':phone')
  async getSystemMessage(@Param('phone') phone: string) {
    const info = await this.leads.getInfoForAgent(phone);
    const message = info
      ? this.prompt.systemMessage(info.realtorName, info.answers)
      : this.prompt.systemMessage();
    return { systemMessage: message };
  }
}
