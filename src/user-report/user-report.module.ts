import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConversationService } from '../agent/clientRedis/conversation.service';
import { UserReportController } from './user-report.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [UserReportController],
  providers: [ConversationService],
})
export class UserReportModule {}
