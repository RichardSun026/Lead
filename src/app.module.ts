import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { ConversationController } from './agent/clientRedis/conversation.controller';
import { AgentController } from './agent/agentLogic/agent.controller';
import { SiteModule } from './site/site.module';
import { UserReportModule } from './user-report/user-report.module';
import { LeadModule } from './lead/lead.module';
import { SupabaseModule } from './supabase/supabase.module';

import { AppService } from './app.service';
import { ConversationService } from './agent/clientRedis/conversation.service';
import { AgentService } from './agent/agentLogic/agent.service';
import { OpenAiService } from './agent/agentHelp/openai.service';
import { PromptService } from './agent/agentHelp/prompt.service';

@Module({
  imports: [
    RedisModule.forRoot({
      url: process.env.REDIS_URL,
      type: 'single',
    }),
    SupabaseModule,
    SiteModule,
    UserReportModule,
    LeadModule,
  ],
  controllers: [AppController, ConversationController, AgentController],
  providers: [
    AppService,
    ConversationService,
    AgentService,
    OpenAiService,
    PromptService,
  ],
})
export class AppModule {}
