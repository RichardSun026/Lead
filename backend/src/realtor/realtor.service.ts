import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RealtorInput {
  name: string;
  email: string;
  phone: string;
}

@Injectable()
export class RealtorService {
  private readonly client: SupabaseClient<any>;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
  }

  async createRealtor(input: RealtorInput) {
    const [first, ...rest] = input.name.trim().split(' ');
    const last = rest.join(' ');
    const { data, error } = await this.client
      .from('realtor')
      .insert({ f_name: first, e_name: last, email: input.email, phone: input.phone })
      .select('uuid,realtor_id')
      .single();
    if (error) throw error;
    return data as { uuid: string; realtor_id: number };
  }
}
