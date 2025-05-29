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
}
