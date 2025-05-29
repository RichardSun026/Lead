import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { ConversationController } from './clientRedis/conversation.controller';
import { AgentController } from './agent/agent.controller';


import { AppService } from './app.service';
import { ConversationService } from './clientRedis/conversation.service';
import { AgentService } from './agent/agent.service';
import { OpenAiService } from './agentHelp/openai.service';
import { PromptService } from './agentHelp/prompt.service';

@Module({
  imports: [
    RedisModule.forRoot({
      url: process.env.REDIS_URL,
      type: 'single',
    }),
  ],
  controllers: [
    AppController,
    ConversationController,
    AgentController,
  ],
  providers: [
    AppService,
    ConversationService,
    AgentService,
    OpenAiService,
    PromptService,
  ],
})
export class AppModule {}
