import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SchedulerService } from '../scheduler/scheduler.service';

export interface EventInput {
  summary: string;
  description?: string;
  start: string; // ISO string
  end: string; // ISO string
  calendarId: string;
  phone: string; // lead phone number for follow-up texts
}

@Injectable()
export class CalendarService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly scheduler: SchedulerService,
  ) {}

  private async refreshAccessToken(realtorId: number, refreshToken: string) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const json = (await res.json()) as {
      access_token: string;
      expires_in: number;
    };
    await this.supabase.updateCredentials(realtorId, json);
    return json.access_token;
  }

  private async getAccessToken(realtorId: number) {
    const creds = await this.supabase.getCredentials(realtorId);
    if (!creds) throw new Error('No Google credentials');
    if (new Date(creds.token_expires) <= new Date()) {
      return this.refreshAccessToken(realtorId, creds.refresh_token);
    }
    return creds.access_token;
  }

  async addEvent(realtorId: number, input: EventInput) {
    const accessToken = await this.getAccessToken(realtorId);
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${input.calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: input.summary,
          description: input.description,
          start: { dateTime: input.start },
          end: { dateTime: input.end },
        }),
      },
    );
    const data = (await res.json()) as { id: string };
    await this.supabase.upsertEvent(
      realtorId,
      data.id,
      input as unknown as Record<string, unknown>,
    );
    await this.scheduler.scheduleFollowUps(input.phone, input.start);
    return data;
  }

  async removeEvent(realtorId: number, calendarId: string, eventId: string) {
    const accessToken = await this.getAccessToken(realtorId);
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    await this.supabase.removeEvent(eventId);
  }

  async getBookedSlots(realtorId: number, date: string) {
    const booked = (await this.supabase.query(
      `booked?realtor_id=eq.${realtorId}&booked_date=eq.${date}&select=booked_time`,
    )) as { booked_time: string }[];

    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;
    const events = (await this.supabase.query(
      `google_calendar_events?realtor_id=eq.${realtorId}&start_time=lte.${end}&end_time=gte.${start}&select=start_time,end_time`,
    )) as { start_time: string; end_time: string }[];

    const times = new Set(booked.map((b) => b.booked_time));
    for (const e of events) {
      const s = new Date(e.start_time);
      const en = new Date(e.end_time);
      for (let t = new Date(s); t < en; t.setMinutes(t.getMinutes() + 30)) {
        times.add(t.toISOString().substring(11, 16));
      }
    }

    return { booked: Array.from(times) };
  }
}
