import { Injectable } from '@nestjs/common';

interface Match {
  [key: string]: string | number;
}

@Injectable()
export class SupabaseService {
  private readonly url = process.env.SUPABASE_URL ?? '';
  private readonly anonKey = process.env.SUPABASE_ANON_KEY ?? '';
  private readonly serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  private headers(role: 'anon' | 'service' = 'anon'): Record<string, string> {
    const key = role === 'service' ? this.serviceRole : this.anonKey;
    return {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  async insert(table: string, data: unknown): Promise<unknown> {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers('service'),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(
        `Supabase insert failed: ${res.status} ${await res.text()}`,
      );
    }
    return res.json();
  }

  async remove(table: string, match: Match): Promise<void> {
    const params = new URLSearchParams(match as Record<string, string>);
    const res = await fetch(
      `${this.url}/rest/v1/${table}?${params.toString()}`,
      {
        method: 'DELETE',
        headers: this.headers('service'),
      },
    );
    if (!res.ok) {
      throw new Error(
        `Supabase delete failed: ${res.status} ${await res.text()}`,
      );
    }
  }

  async fetch(table: string, match: Match): Promise<unknown[]> {
    const params = new URLSearchParams(match as Record<string, string>);
    const res = await fetch(
      `${this.url}/rest/v1/${table}?${params.toString()}`,
      {
        method: 'GET',
        headers: this.headers('service'),
      },
    );
    if (!res.ok) {
      throw new Error(
        `Supabase fetch failed: ${res.status} ${await res.text()}`,
      );
    }
    const data = (await res.json()) as unknown[];
    return data;
  }
}
