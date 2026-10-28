import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const consultations = sqliteTable('consultations', {
 id:text('id').primaryKey(), name:text('name').notNull(), email:text('email').notNull(), phone:text('phone').notNull(), sport:text('sport').notNull(), message:text('message').notNull(), consentAt:text('consent_at').notNull(), createdAt:text('created_at').notNull()
});
