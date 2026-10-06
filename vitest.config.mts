import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname),
      // `server-only` throws outside the react-server condition; unit tests run in plain Node/jsdom.
      'server-only': path.resolve(import.meta.dirname, 'tests/stubs/server-only.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
    // Next loads .env.local at runtime; vitest doesn't, so pages that read env get these test values.
    env: {
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_BOOKING_HOTEL_ID: '26609',
      NEXT_PUBLIC_BOOKING_STYLE_ID: '20249',
      NEXT_PUBLIC_BOOKING_DC_ID: '1161',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    },
  },
});
