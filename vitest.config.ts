import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    root: 'backend',
    include: ['test/**/*.ts'],
  },
});
