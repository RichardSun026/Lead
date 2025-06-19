import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load backend environment so Supabase credentials are available during build
// The config file resides three directories below the repo root
config({ path: resolve(__dirname, '../../../backend/.env') });

// Expose SUPABASE_* variables as VITE_* for the client bundle
if (process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (process.env.SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/onboarding/' : './',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
}));
