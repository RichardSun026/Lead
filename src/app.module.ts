import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { ConversationController } from './clientRedis/conversation.controller';
import { MessageController } from './message/message.controller';

import { AppService } from './app.service';
import { ConversationService } from './clientRedis/conversation.service';
import { MessageService } from './message/message.service';
import { OpenAiService } from './agent/openai.service';

@Module({
  imports: [
    RedisModule.forRoot({
      url: process.env.REDIS_URL,
      type: 'single',
    }),
  ],
  controllers: [AppController, ConversationController, MessageController],
  providers: [AppService, ConversationService, MessageService, OpenAiService],
})
export class AppModule {}
