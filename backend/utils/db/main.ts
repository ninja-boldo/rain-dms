import { Pool } from "pg";
import {
  documentsTable,
  pagesTable,
  statsCountersTable,
} from "../../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, inArray, sql } from "drizzle-orm";
import { StatsTableInfo, StatsTableKeys } from "../types/main";

export async function updateStatsTableKey(
  db: NodePgDatabase<Record<string, never>> & { $client: Pool },
  tableKey: string,
  valueDelta: number,
): Promise<void> {
  await db
    .update(statsCountersTable)
    .set({ value: sql`${statsCountersTable.value} + ${valueDelta}` })
    .where(eq(statsCountersTable.key, tableKey));
}

export async function getKeyFromStatsTable(
  db: NodePgDatabase<Record<string, never>> & { $client: Pool },
  tableKey: string,
): Promise<number> {
  const res = await db
    .select({ value: statsCountersTable.value })
    .from(statsCountersTable)
    .where(eq(statsCountersTable.key, tableKey));

  if (res.length > 0) {
    return res[0].value;
  }

  const tableInfo = await reseedStatsCounters(db);

  console.warn(
    `The stats table key '${tableKey}' wasn't found. Reseeding stats table.`,
  );

  switch (tableKey) {
    case StatsTableKeys.totalDocuments:
      return tableInfo.totalDocCount;

    case StatsTableKeys.totalPages:
      return tableInfo.totalPageCount;

    default:
      throw new Error(
        `Couldn't retrieve value (even after reseeding) for key: ${tableKey}`,
      );
  }
}

export async function getKeysFromStatsTable(
  db: NodePgDatabase<Record<string, never>> & { $client: Pool },
  tableKeys: string[],
): Promise<Record<string, number>> {
  const res = await db
    .select({ key: statsCountersTable.key, value: statsCountersTable.value })
    .from(statsCountersTable)
    .where(inArray(statsCountersTable.key, tableKeys));

  const out: Record<string, number> = {};
  for (const row of res) out[row.key] = row.value;

  const missingKeys = tableKeys.filter((key) => !(key in out));

  if (missingKeys.length > 0) {
    const tableInfo = await reseedStatsCounters(db);

    console.warn(
      `The stats table key(s) '${missingKeys.join(", ")}' weren't found. Reseeding stats table.`,
    );

    for (const key of missingKeys) {
      switch (key) {
        case StatsTableKeys.totalDocuments:
          out[key] = tableInfo.totalDocCount;
          break;

        case StatsTableKeys.totalPages:
          out[key] = tableInfo.totalPageCount;
          break;

        default:
          throw new Error(
            `Couldn't retrieve value (even after reseeding) for key: ${key}`,
          );
      }
    }
  }

  return out;
}

export async function reseedStatsCounters(
  db: NodePgDatabase<Record<string, never>> & { $client: Pool },
): Promise<StatsTableInfo> {
  const [{ count: docCount }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(documentsTable);
  const [{ count: pageCount }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(pagesTable);

  await db
    .insert(statsCountersTable)
    .values([
      { key: StatsTableKeys.totalDocuments, value: docCount },
      { key: StatsTableKeys.totalPages, value: pageCount },
    ])
    .onConflictDoUpdate({
      target: statsCountersTable.key,
      set: { value: sql`excluded.value` },
    });
  return { totalPageCount: pageCount, totalDocCount: docCount };
}
