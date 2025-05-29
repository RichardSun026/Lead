import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { SiteController } from './site.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [SiteController],
})
export class SiteModule {}
