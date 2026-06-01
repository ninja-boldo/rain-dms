import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 255 }).notNull(),
  password_hash: varchar({ length: 255 }).notNull().unique(),
});

export const documentsTable = pgTable("documents", {
  user_id: integer("user_id").references(() => usersTable.id),
  file_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  filepath: text("filepath").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  assigned_tags: text("assigned_tags").array(),
});

export const pagesTable = pgTable("pages", {
  file_id: integer("file_id").references(() => documentsTable.file_id),
  page_idx: integer("page_idx"),
  page_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  page_banner_url: text("page_banner_url"),
  ocr: jsonb("ocr").notNull(),
});

export const workerTable = pgTable("workers", {
  id: varchar({ length: 255 }).primaryKey(),
  ip: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 50 }).notNull().default('pending'), // pending, approved, blocked
  bytes_downloaded: integer().default(0),
  first_seen_at: timestamp("first_seen_at").defaultNow(),
});
