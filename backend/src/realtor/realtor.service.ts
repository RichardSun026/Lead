import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateRealtorDto } from './dto/create-realtor.dto';

@Injectable()
export class RealtorService {
  private readonly client: SupabaseClient<any>;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.client = createClient(url, key);
  }

  async createRealtor(input: CreateRealtorDto) {
    const [first, ...rest] = input.name.trim().split(' ');
    const last = rest.join(' ');
    const { data, error } = await this.client
      .from('realtor')
      .insert({
        realtor_id: input.userId,
        f_name: first,
        e_name: last,
      })
      .select('uuid,realtor_id')
      .single();
    if (error) throw error;
    return data as { uuid: string; realtor_id: string };
  }
}
