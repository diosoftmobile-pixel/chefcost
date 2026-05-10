import { afterAll } from 'vitest';
import fs from 'fs';

// Run migrations so all columns exist in the test DB
await import('../../db/migrate.js');

afterAll(() => {
  const dbPath = process.env.DB_PATH;
  if (dbPath && fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});
