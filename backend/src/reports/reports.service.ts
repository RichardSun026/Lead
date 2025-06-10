import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { LeadsService } from '../leads/leads.service';
import { ConversationService } from '../clientRedis/conversation.service';
import { OpenAiService } from '../agentHelp/openai.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly leads: LeadsService,
    private readonly conversation: ConversationService,
    private readonly openai: OpenAiService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  private surveyKey(phone: string) {
    return `report:${phone}:survey`;
  }
  private messageKey(phone: string) {
    return `report:${phone}:messages`;
  }
  private messageCountKey(phone: string) {
    return `report:${phone}:msgcount`;
  }

  async getReport(phone: string) {
    const lead = await this.leads.getLeadReport(phone);
    if (!lead) return null;

    const surveySummary = await this.getSurveySummary(phone, lead.answers);
    const messageSummary = await this.getMessageSummary(phone);

    return {
      name: lead.name,
      phone: lead.phone,
      address: lead.address,
      zipcode: lead.address,
      surveySummary,
      messageSummary,
    };
  }

  private async getSurveySummary(
    phone: string,
    answers: { question: string; answer: string }[],
  ): Promise<string> {
    const key = this.surveyKey(phone);
    const cached = await this.redis.get(key);
    if (cached) return cached;

    if (answers.length === 0) return '';
    const content =
      'Summarize these survey answers:\n' +
      answers.map((a) => `${a.question}: ${a.answer}`).join('\n');
    const reply = await this.openai.chat(
      [
        { role: 'user', content },
      ],
      'gpt-4o-mini',
    );
    const summary = reply.content ?? '';
    await this.redis.set(key, summary);
    return summary;
  }

  private async getMessageSummary(phone: string): Promise<string> {
    const currentLen = await this.conversation.length(phone);
    const [cached, countRaw] = await this.redis.mget(
      this.messageKey(phone),
      this.messageCountKey(phone),
    );
    const cachedCount = countRaw ? parseInt(countRaw, 10) : 0;
    if (cached && cachedCount === currentLen) return cached;

    const history = await this.conversation.fetchAll(phone);
    if (history.length === 0) return '';
    const text = history
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')
      .slice(-12000);
    const reply = await this.openai.chat(
      [
        { role: 'user', content: `Summarize this conversation:\n${text}` },
      ],
      'gpt-4o-mini',
    );
    const summary = reply.content ?? '';
    await this.redis.mset(
      this.messageKey(phone),
      summary,
      this.messageCountKey(phone),
      String(currentLen),
    );
    return summary;
  }
}
