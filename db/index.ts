import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

// For serverless environments, we should use a single connection per function invocation
// or a connection pooler like Neon's pooler.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
