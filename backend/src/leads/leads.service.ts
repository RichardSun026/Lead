import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface LeadInput {
  name: string;
  phone: string;
  email: string;
  realtorUuid: string;
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

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
  }

  async createLead(input: LeadInput): Promise<void> {
    const { data } = await this.client
      .from('realtor')
      .select('realtor_id')
      .eq('uuid', input.realtorUuid)
      .maybeSingle();
    const realtorId = (data as { realtor_id: number } | null)?.realtor_id;

    if (!realtorId) {
      throw new Error('Invalid realtor');
    }

    const [firstName, ...rest] = input.name.trim().split(' ');
    const lastName = rest.join(' ');

    await this.client.from('leads').upsert({
      phone: input.phone,
      realtor_id: realtorId,
      first_name: firstName,
      last_name: lastName,
      email: input.email,
      address: input.zipcode,
      lead_state: 'cold',
      home_type: input.homeType,
      home_built: input.yearBuilt,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      sqft: input.sqft,
      occupancy: input.occupancy,
      sell_time: input.timeframe,
      working_with_agent:
        input.professional?.toLowerCase() === 'yes' ? true : false,
      looking_to_buy: input.expert?.toLowerCase() === 'yes' ? true : false,
    });
  }

  async findByPhone(phone: string) {
    const { data } = await this.client
      .from('leads')
      .select('first_name,last_name,phone')
      .eq('phone', phone)
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

  async findRealtor(uuid: string) {
    console.debug('[LeadsService] fetching realtor', uuid);
    const { data, error } = await this.client
      .from('realtor')
      .select('realtor_id,f_name,e_name,video_url,website_url')
      .eq('uuid', uuid)
      .maybeSingle();
    if (error) {
      console.error('[LeadsService] Supabase error', error);
      throw error;
    }
    const realtor = data as {
      realtor_id: number;
      f_name: string;
      e_name: string;
      video_url: string;
      website_url: string;
    } | null;
    if (!realtor) {
      console.debug('[LeadsService] no realtor found for', uuid);
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

  async getInfoForAgent(phone: string): Promise<{
    realtorName: string;
    answers: { question: string; answer: string }[];
  } | null> {
    const { data } = await this.client
      .from('leads')
      .select(
        `address,home_type,bedrooms,bathrooms,sqft,home_built,occupancy,sell_time,working_with_agent,looking_to_buy,realtor:realtor_id(f_name,e_name)`,
      )
      .eq('phone', phone)
      .maybeSingle();
    const lead =
      (data as {
        address?: string;
        home_type?: string;
        bedrooms?: string;
        bathrooms?: string;
        sqft?: string;
        home_built?: string;
        occupancy?: string;
        sell_time?: string;
        working_with_agent?: boolean;
        looking_to_buy?: boolean;
        realtor?: { f_name?: string; e_name?: string } | null;
      } | null) ?? null;
    if (!lead) return null;

    const realtorName = lead.realtor
      ? `${lead.realtor.f_name ?? ''} ${lead.realtor.e_name ?? ''}`.trim()
      : 'the realtor';

    const bool = (v?: boolean) =>
      v === true ? 'Yes' : v === false ? 'No' : '';

    const answers = [
      { question: 'ZIP code', answer: lead.address ?? '' },
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
}
