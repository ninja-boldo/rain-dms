import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// USERS TABLE
// ─────────────────────────────────────────────────────────────────────────────
export const usersTable = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 255 }).notNull(),
    password_hash: varchar({ length: 255 }).notNull().unique(),
  },
  (table) => [
    // Primary lookup index for standard login/auth sessions
    index("idx_users_username").on(table.username),
    // Composite index for broad user-profile filtering sequences
    index("main_idx_users").on(table.id, table.username),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS TABLE
// ─────────────────────────────────────────────────────────────────────────────
export const documentsTable = pgTable(
  "documents",
  {
    user_id: integer("user_id").references(() => usersTable.id),
    file_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    filepath: text("filepath").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    assigned_tags: text("assigned_tags").array(),

    // Key name is camelCase 'fileHash', mapped explicitly to physical column "file_hash"
    fileHash: text("file_hash").notNull().unique(),
  },
  (table) => [
    // Change this to use the exact property name: table.fileHash
    index("idx_documents_file_hash").on(table.fileHash),

    index("main_idx_documents").on(
      table.file_id,
      table.filepath,
      table.user_id,
      table.createdAt,
    ),
  ],
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGES TABLE
// ─────────────────────────────────────────────────────────────────────────────
export const pagesTable = pgTable(
  "pages",
  {
    file_id: integer("file_id").references(() => documentsTable.file_id),
    page_idx: integer("page_idx"),
    page_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    page_banner_url: text("page_banner_url"),
    ocr: jsonb("ocr").notNull(),
  },
  (table) => [
    // Foreign key lookup optimization when fetching pages for a specific document
    index("idx_pages_file_id").on(table.file_id),

    // Composite index for sequential document layout building
    index("main_idx_pages").on(table.file_id, table.page_id, table.page_idx),
  ],
);
