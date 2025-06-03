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
      tracking_parameters: input.tracking,
    });
  }

  async findByTracking(tracking: string) {
    const { data } = await this.client
      .from('leads')
      .select('first_name,last_name,phone')
      .ilike('tracking_parameters', `%${tracking}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const typed = data as {
      first_name: string;
      last_name: string;
      phone: string;
    } | null;
    if (!typed) return null;
    return {
      full_name: `${typed.first_name} ${typed.last_name}`.trim(),
      phone: typed.phone,
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
    const typed = data as {
      realtor_id: number;
      f_name: string;
      e_name: string;
      video_url: string | null;
      website_url: string | null;
    } | null;
    if (!typed) {
      console.debug('[LeadsService] no realtor found for', uuid);
      return null;
    }
    console.debug('[LeadsService] found realtor id', typed.realtor_id);
    return {
      realtorId: typed.realtor_id,
      name: `${typed.f_name} ${typed.e_name}`.trim(),
      video_url: typed.video_url,
      website_url: typed.website_url,
    };
  }
}
