import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { LeadController } from './lead.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [LeadController],
})
export class LeadModule {}
