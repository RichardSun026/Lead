import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from '../clientRedis/conversation.service';
import { PromptService } from '../agentHelp/prompt.service';
import { OpenAiService } from '../agentHelp/openai.service';
import { BookingService } from '../booking/booking.service';
import { CalendarService } from '../calendar/calendar.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { MessengerService } from '../messenger/messenger.service';
import { LeadsService } from '../leads/leads.service';
import OpenAI from 'openai';

@Injectable()
export class AgentService {
  private readonly log = new Logger('Agent');
  constructor(
    private readonly conversation: ConversationService,
    private readonly prompt: PromptService,
    private readonly openai: OpenAiService,
    private readonly booking: BookingService,
    private readonly calendar: CalendarService,
    private readonly scheduler: SchedulerService,
    private readonly messenger: MessengerService,
    private readonly leads: LeadsService,
  ) {}

  async send(
    phone: string,
    userMsg: string,
    model = 'gpt-4.1',
  ): Promise<string> {
    await this.conversation.store(phone, { role: 'user', content: userMsg });
    return this.agentLoop(phone, model);
  }

  private async agentLoop(phone: string, model: string): Promise<string> {
    const history = await this.conversation.fetchAll(phone);
    const info = await this.leads.getInfoForAgent(phone);
    const now = new Date().toISOString();
    const system = info
      ? this.prompt.systemMessage(
          info.realtorName,
          info.answers,
          info.leadName,
          info.phone,
          now,
        )
      : this.prompt.systemMessage('the realtor', [], '', phone, now);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      ...history,
    ];

    const reply = await this.openai.chat(messages, model);
    await this.conversation.store(phone, reply);

    const calls = reply.tool_calls ?? [];
    if (calls.length === 0) {
      if (reply.content) {
        await this.messenger.sendSms(phone, reply.content, false);
      }
      return reply.content ?? '';
    }

    for (const call of calls) {
      const { name } = call.function;
      const argsRaw = call.function.arguments ?? '{}';
      let args: unknown;
      try {
        args = JSON.parse(argsRaw);
      } catch {
        this.log.error(`Error parsing JSON for ${name}: ${argsRaw}`);
        args = {};
      }
      let result: unknown;
      switch (name) {
        case 'search_web':
          if (isSearchArgs(args)) {
            const { query } = args as { query: string };
            result = await this.openai.search(query);
          } else {
            result = { error: 'Missing or invalid { query: string }.' };
          }
          break;
        case 'book_time':
          if (isBookArgs(args)) {
            const details = await this.leads.getBookingInfo(phone);
            if (!details) {
              result = { error: 'lead not found' };
              break;
            }
            const booking = { ...details, ...args };
            try {
              await this.booking.createOrUpdate(booking);
              result = { status: 'booked' };
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'booking failed';
              result = { error: msg };
            }
          } else {
            result = { error: 'invalid booking args' };
          }
          break;
        case 'list_available_times':
          if (isAvailArgs(args)) {
            const { realtor_id, date } = args as {
              realtor_id: string;
              date: string;
            };
            const open = await this.calendar.getOpenSlots(realtor_id, date);
            result = { open: open.open };
          } else {
            result = { error: 'invalid availability args' };
          }
          break;
        case 'stop_messages':
          if (isStopArgs(args)) {
            await this.scheduler.cancelMessages(args.phone);
            result = { status: 'stopped' };
          } else {
            result = { error: 'invalid stop args' };
          }
          break;
        default:
          result = { error: `Tool ${name} not implemented` };
      }

      const toolMsg: OpenAI.Chat.ChatCompletionMessageParam = {
        role: 'tool',
        tool_call_id: call.id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      };
      await this.conversation.store(phone, toolMsg);
    }

    return this.agentLoop(phone, model);
  }
}

function isSearchArgs(args: unknown): args is { query: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'query' in args &&
    typeof (args as { query: unknown }).query === 'string'
  );
}

function isBookArgs(
  args: unknown,
): args is { booked_date: string; booked_time: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'booked_date' in args &&
    'booked_time' in args
  );
}

function isAvailArgs(
  args: unknown,
): args is { realtor_id: string; date: string } {
  return (
    typeof args === 'object' &&
    args !== null &&
    'realtor_id' in args &&
    'date' in args
  );
}

function isStopArgs(args: unknown): args is { phone: string } {
  return typeof args === 'object' && args !== null && 'phone' in args;
}
