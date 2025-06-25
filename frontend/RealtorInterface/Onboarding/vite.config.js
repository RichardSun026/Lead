import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the backend .env so local development
// builds the app with the correct Supabase credentials without needing a
// dedicated .env file inside this package.
config({ path: resolve(__dirname, '../../../backend/.env') });

// Vite only exposes variables prefixed with `VITE_`. Mirror the backend
// variables using that prefix so `import.meta.env` works as expected.
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
