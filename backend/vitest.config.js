import { defineConfig } from 'vitest/config';
import os from 'os';
import path from 'path';

export default defineConfig({
  test: {
    pool: 'forks',
    maxWorkers: 1,
    env: {
      DB_PATH: path.join(os.tmpdir(), 'app4chef-test.db'),
      JWT_SECRET: 'test-secret-key',
    },
    setupFiles: ['./src/__tests__/helpers/setup.js'],
    testTimeout: 10000,
  },
});
