import { getTableColumns, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export function onConflictDoUpdateAll(table: PgTable) {
  return Object.fromEntries(
    Object.keys(getTableColumns(table)).map((column) => [
      column,
      sql.raw(`excluded."${column}"`),
    ]),
  );
}
