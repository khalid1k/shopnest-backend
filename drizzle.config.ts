import { defineConfig } from 'drizzle-kit';
import * as schema from './src/modules/database/schema';
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not set in your environment variables');
}
export default defineConfig({
  schema: './src/modules/database/schema', // folder containing schema files
  out: './src/modules/database/migrations', // folder for migrations
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
