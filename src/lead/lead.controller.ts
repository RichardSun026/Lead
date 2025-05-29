import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface LeadPayload {
  uuid: string;
  full_name: string;
  phone: string;
  address?: string;
  lead_state?: string;
  home_type?: string;
  home_built?: string;
  home_worth?: string;
  sell_time?: string;
  home_condition?: string;
  working_with_agent?: string;
  looking_to_buy?: string;
  ad_id?: string;
  tracking_parameters?: string;
}

@Controller('webhook')
export class LeadController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post()
  @HttpCode(200)
  async receiveLead(@Body() payload: LeadPayload) {
    const nameParts = (payload.full_name ?? '').split(' ');
    const [first_name, ...rest] = nameParts;
    const last_name = rest.join(' ');

    await this.supabase.insert('Leads', {
      phone: payload.phone,
      realtor_id: this.getRealtorId(payload.uuid),
      first_name,
      last_name,
      address: payload.address,
      lead_state: payload.lead_state,
      home_type: payload.home_type,
      home_built: payload.home_built,
      home_worth: payload.home_worth,
      sell_time: payload.sell_time,
      home_condition: payload.home_condition,
      working_with_agent: payload.working_with_agent,
      looking_to_buy: payload.looking_to_buy,
      ad_id: payload.ad_id,
      tracking_parameters: payload.tracking_parameters,
    });

    // schedule reminder in 2 minutes
    const due = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    await this.supabase.insert('scheduled_messages', {
      phone: payload.phone,
      scheduled_time: due,
      message_type: 'initial_followup',
      message_text: `Hello ${first_name}! Thank you for your interest.`,
    });
    return { status: 'ok' };
  }

  // In real system we'd look up the realtor ID by UUID
  private getRealtorId(uuid: string): number {
    // placeholder mapping
    return uuid ? 1 : 0;
  }
}
