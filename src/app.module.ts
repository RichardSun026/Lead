import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { ConversationController } from './clientRedis/conversation.controller';
import { MessageController } from './message/message.controller';
import { WeekPlanController } from './clientRedis/weekplan.controller';

import { AppService } from './app.service';
import { ConversationService } from './clientRedis/conversation.service';
import { MessageService } from './message/message.service';
import { OpenAiService } from './agent/openai.service';
import { PromptService } from './agent/prompt.service';

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
    MessageController,
    WeekPlanController,
  ],
  providers: [
    AppService,
    ConversationService,
    MessageService,
    OpenAiService,
    PromptService,
  ],
})
export class AppModule {}
