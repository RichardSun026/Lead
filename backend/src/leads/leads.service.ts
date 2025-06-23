import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizePhone } from '../utils/phone';

interface LeadInput {
  name: string;
  phone: string;
  email: string;
  realtorId: string;
  zipcode?: string;
  homeType?: string;
  bedrooms?: string;
  bathrooms?: string;
  sqft?: string;
  yearBuilt?: string;
  occupancy?: string;
  timeframe?: string;
  professional?: string;
  expert?: string;
}

@Injectable()
export class LeadsService {
  private readonly client: SupabaseClient<any>;
  private readonly uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
  }

  async markHotIfCold(phone: string): Promise<void> {
    const sanitized = normalizePhone(phone);
    const { data, error } = await this.client
      .from('leads')
      .select('lead_state')
      .eq('phone', sanitized)
      .maybeSingle();
    if (error) {
      console.error('[LeadsService] failed to fetch lead state', error);
      return;
    }
    const lead = data as { lead_state?: string } | null;
    if (!lead) return;
    if (lead.lead_state === 'cold') {
      const { error: updErr } = await this.client
        .from('leads')
        .update({ lead_state: 'hot' })
        .eq('phone', sanitized);
      if (updErr) {
        console.error('[LeadsService] failed to update lead state', updErr);
      }
    }
  }

  async createLead(input: LeadInput): Promise<void> {
    console.debug('[LeadsService] createLead called with', input);

    if (!this.uuidRe.test(input.realtorId)) {
      console.error(
        '[LeadsService] invalid realtor id format',
        input.realtorId,
      );
      throw new Error('Invalid realtor');
    }

    const { error: realtorErr } = await this.client
      .from('realtor')
      .select('realtor_id')
      .eq('realtor_id', input.realtorId)
      .maybeSingle();
    if (realtorErr) {
      console.error('[LeadsService] failed to fetch realtor', realtorErr);
      throw realtorErr;
    }

    const realtorId = input.realtorId;

    const [firstName, ...rest] = input.name.trim().split(' ');
    const lastName = rest.join(' ');
    console.debug('[LeadsService] parsed name', { firstName, lastName });

    const sanitizedPhone = normalizePhone(input.phone);
    const leadRecord = {
      phone: sanitizedPhone,
      realtor_id: realtorId,
      first_name: firstName,
      last_name: lastName,
      email: input.email,
      zipcode: input.zipcode,
      lead_state: 'cold',
      home_type: input.homeType,
      home_built: input.yearBuilt,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      sqft: input.sqft,
      occupancy: input.occupancy,
      sell_time: input.timeframe,
      working_with_agent: input.professional
        ? input.professional.toLowerCase() === 'yes'
          ? 'yes'
          : 'no'
        : undefined,
      looking_to_buy: input.expert
        ? input.expert.toLowerCase() === 'yes'
          ? 'yes'
          : 'no'
        : undefined,
    };
    console.debug('[LeadsService] upserting lead', leadRecord);

    const { error: upsertError } = await this.client
      .from('leads')
      .upsert(leadRecord);
    if (upsertError) {
      console.error('[LeadsService] failed to upsert lead', upsertError);
      throw upsertError;
    }

    console.debug('[LeadsService] lead saved successfully');
  }

  async findByPhone(phone: string) {
    const sanitized = normalizePhone(phone);
    const { data } = await this.client
      .from('leads')
      .select('first_name,last_name,phone')
      .eq('phone', sanitized)
      .maybeSingle();
    const lead = data as {
      first_name: string;
      last_name: string;
      phone: string;
    } | null;
    if (!lead) return null;
    return {
      full_name: `${lead.first_name} ${lead.last_name}`.trim(),
      phone: lead.phone,
    };
  }

  async findRealtor(realtorId: string) {
    console.debug('[LeadsService] fetching realtor', realtorId);
    if (!this.uuidRe.test(realtorId)) {
      console.debug('[LeadsService] invalid uuid format', realtorId);
      return null;
    }
    const { data, error } = await this.client
      .from('realtor')
      .select('realtor_id,f_name,e_name,video_url,website_url')
      .eq('realtor_id', realtorId)
      .maybeSingle();
    if (error) {
      console.error('[LeadsService] Supabase error', error);
      throw error;
    }
    const realtor = data as {
      realtor_id: string;
      f_name: string;
      e_name: string;
      video_url: string;
      website_url: string;
    } | null;
    if (!realtor) {
      console.debug('[LeadsService] no realtor found for', realtorId);
      return null;
    }
    console.debug('[LeadsService] found realtor id', realtor.realtor_id);
    return {
      realtorId: realtor.realtor_id,
      name: `${realtor.f_name} ${realtor.e_name}`.trim(),
      video_url: realtor.video_url,
      website_url: realtor.website_url,
    };
  }

  async getBookingInfo(phone: string): Promise<{
    phone: string;
    full_name: string;
    time_zone: string;
    realtor_id: string;
  } | null> {
    const sanitized = normalizePhone(phone);
    const { data } = await this.client
      .from('leads')
      .select('first_name,last_name,phone,time_zone,realtor_id')
      .eq('phone', sanitized)
      .maybeSingle();
    const lead =
      (data as {
        first_name?: string;
        last_name?: string;
        phone: string;
        time_zone: string;
        realtor_id: string;
      } | null) ?? null;
    if (!lead) return null;
    return {
      phone: lead.phone,
      full_name: `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim(),
      time_zone: lead.time_zone,
      realtor_id: lead.realtor_id,
    };
  }

  async getInfoForAgent(phone: string): Promise<{
    realtorName: string;
    answers: { question: string; answer: string }[];
  } | null> {
    const sanitized = normalizePhone(phone);
    const { data } = await this.client
      .from('leads')
      .select(
        `zipcode,home_type,bedrooms,bathrooms,sqft,home_built,occupancy,sell_time,working_with_agent,looking_to_buy,realtor:realtor_id(f_name,e_name)`,
      )
      .eq('phone', sanitized)
      .maybeSingle();
    const lead =
      (data as {
        zipcode?: string;
        home_type?: string;
        bedrooms?: string;
        bathrooms?: string;
        sqft?: string;
        home_built?: string;
        occupancy?: string;
        sell_time?: string;
        working_with_agent?: string;
        looking_to_buy?: string;
        realtor?: { f_name?: string; e_name?: string } | null;
      } | null) ?? null;
    if (!lead) return null;

    const realtorName = lead.realtor
      ? `${lead.realtor.f_name ?? ''} ${lead.realtor.e_name ?? ''}`.trim()
      : 'the realtor';

    const bool = (v?: string) => {
      if (!v) return '';
      return v.toLowerCase() === 'yes'
        ? 'Yes'
        : v.toLowerCase() === 'no'
          ? 'No'
          : '';
    };

    const answers = [
      { question: 'ZIP code', answer: lead.zipcode ?? '' },
      { question: 'Home type', answer: lead.home_type ?? '' },
      { question: 'Bedrooms', answer: lead.bedrooms ?? '' },
      { question: 'Bathrooms', answer: lead.bathrooms ?? '' },
      { question: 'Square footage', answer: lead.sqft ?? '' },
      { question: 'Year built', answer: lead.home_built ?? '' },
      { question: 'Occupancy', answer: lead.occupancy ?? '' },
      { question: 'Selling timeframe', answer: lead.sell_time ?? '' },
      {
        question: 'Working with an agent',
        answer: bool(lead.working_with_agent),
      },
      {
        question: 'Looking to buy',
        answer: bool(lead.looking_to_buy),
      },
    ].filter((a) => a.answer);

    return { realtorName, answers };
  }

  async getLeadReport(phone: string): Promise<{
    name: string;
    phone: string;
    zipcode: string | null;
    answers: { question: string; answer: string }[];
  } | null> {
    const sanitized = normalizePhone(phone);
    const { data } = await this.client
      .from('leads')
      .select(
        `first_name,last_name,phone,zipcode,home_type,bedrooms,bathrooms,sqft,home_built,occupancy,sell_time,working_with_agent,looking_to_buy`,
      )
      .eq('phone', sanitized)
      .maybeSingle();
    const lead =
      (data as {
        first_name?: string;
        last_name?: string;
        phone: string;
        zipcode?: string;
        home_type?: string;
        bedrooms?: string;
        bathrooms?: string;
        sqft?: string;
        home_built?: string;
        occupancy?: string;
        sell_time?: string;
        working_with_agent?: string;
        looking_to_buy?: string;
      } | null) ?? null;
    if (!lead) return null;

    const bool = (v?: string) => {
      if (!v) return '';
      return v.toLowerCase() === 'yes'
        ? 'Yes'
        : v.toLowerCase() === 'no'
          ? 'No'
          : '';
    };

    const answers = [
      { question: 'ZIP code', answer: lead.zipcode ?? '' },
      { question: 'Home type', answer: lead.home_type ?? '' },
      { question: 'Bedrooms', answer: lead.bedrooms ?? '' },
      { question: 'Bathrooms', answer: lead.bathrooms ?? '' },
      { question: 'Square footage', answer: lead.sqft ?? '' },
      { question: 'Year built', answer: lead.home_built ?? '' },
      { question: 'Occupancy', answer: lead.occupancy ?? '' },
      { question: 'Selling timeframe', answer: lead.sell_time ?? '' },
      {
        question: 'Working with an agent',
        answer: bool(lead.working_with_agent),
      },
      { question: 'Looking to buy', answer: bool(lead.looking_to_buy) },
    ].filter((a) => a.answer);

    return {
      name: `${lead.first_name ?? ''} ${lead.last_name ?? ''}`.trim(),
      phone: lead.phone,
      zipcode: lead.zipcode ?? null,
      answers,
    };
  }
}
