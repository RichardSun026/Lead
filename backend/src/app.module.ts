import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

import { AppController } from './app.controller';
import { ConversationController } from './clientRedis/conversation.controller';
import { AgentController } from './agentLogic/agent.controller';
import { CalendarController } from './calendar/calendar.controller';
import { SchedulerController } from './scheduler/scheduler.controller';
import { LeadsController } from './leads/leads.controller';

import { AppService } from './app.service';
import { ConversationService } from './clientRedis/conversation.service';
import { AgentService } from './agentLogic/agent.service';

import { CalendarService } from './calendar/calendar.service';
import { SupabaseService } from './supabase/supabase.service';
import { SchedulerService } from './scheduler/scheduler.service';

import { LeadsService } from './leads/leads.service';
import { MessengerService } from './messenger/messenger.service';
import { BookingService } from './booking/booking.service';
import { BookingController } from './booking/booking.controller';


import { OpenAiService } from './agentHelp/openai.service';
import { PromptService } from './agentHelp/prompt.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'backend/.env',
    }),

    RedisModule.forRoot({
      url: process.env.REDIS_URL,
      type: 'single',
    }),
  ],
  controllers: [
    AppController,
    ConversationController,
    AgentController,
    CalendarController,
    SchedulerController,
    LeadsController,
    BookingController,
  ],
  providers: [
    AppService,
    ConversationService,
    AgentService,
    SchedulerService,
    OpenAiService,
    PromptService,
    CalendarService,
    SupabaseService,
    LeadsService,
    MessengerService,
    BookingService,
  ],
})
export class AppModule {}
