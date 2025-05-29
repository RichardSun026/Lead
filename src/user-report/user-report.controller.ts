import { Controller, Get, Param } from '@nestjs/common';
import { ConversationService } from '../agent/clientRedis/conversation.service';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('report')
export class UserReportController {
  constructor(
    private readonly conversation: ConversationService,
    private readonly supabase: SupabaseService,
  ) {}

  @Get(':phone')
  async generate(@Param('phone') phone: string) {
    const [lead] = await this.supabase.fetch('Leads', { phone });
    const messages = await this.conversation.fetchAll(phone);
    return { lead, messages };
  }
}
