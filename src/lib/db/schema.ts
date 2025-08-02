import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Folders table
export const folders = pgTable(
  'folders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    userId: text('user_id').notNull(), // Clerk user ID directly
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('folders_user_id_idx').on(table.userId),
  })
);

// Notes table
export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    tags: jsonb('tags').$type<string[]>().default([]),
    folderId: uuid('folder_id').references(() => folders.id, {
      onDelete: 'set null',
    }),
    userId: text('user_id').notNull(), // Clerk user ID directly
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('notes_user_id_idx').on(table.userId),
    folderIdIdx: index('notes_folder_id_idx').on(table.folderId),
    userIdCreatedAtIdx: index('notes_user_id_created_at_idx').on(
      table.userId,
      table.createdAt
    ),
  })
);

// Type exports for TypeScript
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
