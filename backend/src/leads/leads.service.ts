import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface LeadInput {
  name: string;
  phone: string;
  email: string;
  realtorUuid: string;
  tracking: string;
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
      .from('Realtor')
      .select('realtor_id')
      .eq('uuid', input.realtorUuid)
      .maybeSingle();
    const realtorId = (data as { realtor_id: number } | null)?.realtor_id;

    if (!realtorId) {
      throw new Error('Invalid realtor');
    }

    const [firstName, ...rest] = input.name.trim().split(' ');
    const lastName = rest.join(' ');

    await this.client.from('Leads').upsert({
      phone: input.phone,
      realtor_id: realtorId,
      first_name: firstName,
      last_name: lastName,
      email: input.email,
      tracking_parameters: input.tracking,
    });
  }

  async findByTracking(tracking: string) {
    const { data } = await this.client
      .from('Leads')
      .select('first_name,last_name,phone')
      .ilike('tracking_parameters', `%${tracking}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return null;
    return {
      full_name: `${data.first_name} ${data.last_name}`.trim(),
      phone: data.phone,
    };
  }

  async findRealtor(uuid: string) {
    console.debug('[LeadsService] fetching realtor', uuid);
    const { data, error } = await this.client
      .from('Realtor')
      .select('realtor_id,f_name,e_name,video_url,website_url')
      .eq('uuid', uuid)
      .maybeSingle();
    if (error) {
      console.error('[LeadsService] Supabase error', error);
      throw error;
    }
    if (!data) {
      console.debug('[LeadsService] no realtor found for', uuid);
      return null;
    }
    console.debug('[LeadsService] found realtor id', data.realtor_id);
    return {
      realtorId: data.realtor_id,
      name: `${data.f_name} ${data.e_name}`.trim(),
      video_url: data.video_url,
      website_url: data.website_url,
    };
  }
}
