import { Pool } from "pg";
import { statsCountersTable } from "../../db/schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, inArray, sql } from "drizzle-orm";

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
  const res: {
    value: number;
  }[] = await db
    .select({ value: statsCountersTable.value })
    .from(statsCountersTable)
    .where(eq(statsCountersTable.key, tableKey));
  if (res.length === 0) {
    throw Error("this Key doesnt seem to exist in the table");
  }
  return res[0].value;
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
  for (const key of tableKeys) {
    if (!(key in out)) throw new Error(`stats key "${key}" does not exist`);
  }
  return out;
}
