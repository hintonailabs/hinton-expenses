import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { buildWhere } from "./transactionRepository";

// Turns the WHERE clause into SQL text + parameters so we can check it without a database.
const render = (filters: Parameters<typeof buildWhere>[1]) => {
  const { sql, params } = new PgDialect().sqlToQuery(buildWhere("user-1", filters));
  return { sql, params };
};

describe("buildWhere", () => {
  it("always limits to the signed-in user", () => {
    const { sql, params } = render({});
    expect(sql).toContain('"user_id" = $1');
    expect(params).toEqual(["user-1"]);
  });

  it("searches the title case-insensitively", () => {
    const { sql, params } = render({ q: "bir" });
    expect(sql).toContain('"title" ilike $2');
    expect(params).toEqual(["user-1", "%bir%"]);
  });

  it("escapes % and _ typed by the user", () => {
    expect(render({ q: "50%_off" }).params[1]).toBe("%50\\%\\_off%");
  });

  it("applies the date range inclusively", () => {
    const { sql, params } = render({ from: "2026-10-01", to: "2026-10-31" });
    expect(sql).toContain('"date" >= $2');
    expect(sql).toContain('"date" <= $3');
    expect(params).toEqual(["user-1", "2026-10-01", "2026-10-31"]);
  });
});
