import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// This is a placeholder schema. Replace this with your actual tables.
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
});
