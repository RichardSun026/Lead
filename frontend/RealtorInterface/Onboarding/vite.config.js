import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the backend .env for local development so
// the Supabase credentials do not need to be duplicated here.
config({ path: resolve(__dirname, '../../../backend/.env') });

// Mirror the backend variables using the Vite prefix so `import.meta.env`
// works as expected when building locally or via Docker.
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (!process.env.VITE_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
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
