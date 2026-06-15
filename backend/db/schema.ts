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
    username: varchar({ length: 255 }).notNull().unique(),
    password_hash: varchar({ length: 255 }).notNull(),
    encrypted_key: varchar({ length: 255 }).notNull(),
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
    fileS3Key: text("file_s3_key").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    assigned_tags: text("assigned_tags").array(),
    spawnedInPipelineIso: text("spawned_in_pipeline_iso").notNull(),
    fileHash: text("file_hash").notNull().unique(),
    encryption_key: text("encryption_key"),
  },
  (table) => [
    // Change this to use the exact property name: table.fileHash
    index("idx_documents_file_hash").on(table.fileHash),

    index("main_idx_documents").on(
      table.file_id,
      table.fileS3Key,
      table.user_id,
      table.createdAt,
    ),
  ],
);

export const fileKeyTempTable = pgTable(
  // this is meant to already store the encrypted encryption key while not already suggesting its been merged
  "fileKey",
  {
    fileS3Key: text("file_s3_key").notNull(),
    encryptionKey: text("encryption_key").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_file_down_key").on(table.fileS3Key),
    index("idx_file_encrypted_key").on(table.encryptionKey),
    index("idx_file_created_at").on(table.createdAt),
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
