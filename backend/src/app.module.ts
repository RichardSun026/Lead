import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
import { TwilioService } from './twilio/twilio.service';
import { BookingService } from './booking/booking.service';
import { BookingController } from './booking/booking.controller';
import { SystemMessageController } from './system-message.controller';
import { RealtorController } from './realtor/realtor.controller';
import { RealtorService } from './realtor/realtor.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';
import { TwilioController } from './twilio/twilio.controller';

import { OpenAiService } from './agentHelp/openai.service';
import { PromptService } from './agentHelp/prompt.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'backend/.env',
    }),

    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', '..', 'frontend', 'site', 'dist'),
        serveRoot: '/',
      },
      {
        rootPath: join(__dirname, '..', '..', 'frontend', 'survey', 'dist'),
        serveRoot: '/survey',
      },
      {
        rootPath: join(
          __dirname,
          '..',
          '..',
          'frontend',
          'RealtorInterface',
          'Onboarding',
          'dist',
        ),
        serveRoot: '/realtor',
      },
      {
        rootPath: join(
          __dirname,
          '..',
          '..',
          'frontend',
          'RealtorInterface',
          'Console',
          'dist',
        ),
        serveRoot: '/console',
      },
    ),

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
    RealtorController,
    SystemMessageController,
    ReportsController,
    TwilioController,
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
    TwilioService,
    BookingService,
    RealtorService,
    ReportsService,
  ],
})
export class AppModule {}
