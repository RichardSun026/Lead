import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { ConversationController } from './conversation/conversation.controller';
import { MessageController } from './message/message.controller';

import { AppService } from './app.service';
import { ConversationService } from './conversation/conversation.service';
import { MessageService } from './message/message.service';
import { OpenAiService } from './openai/openai.service';

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
