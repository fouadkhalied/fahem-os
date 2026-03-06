import { drizzle } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema';

// PGLite can persist to a directory or run in-memory
// We'll use a local directory for persistence in development
const client = new PGlite('./.pglite');

export const db = drizzle(client, { schema });

