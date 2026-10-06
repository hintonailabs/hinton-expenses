import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("reads quoted values with commas and numbers lines from the header", () => {
    const { header, rows } = parseCsv('date,title,amount\r\n2026-10-01,"Dinner, with friends",900\n\n2026-10-02,Tea,20\n');
    expect(header).toEqual(["date", "title", "amount"]);
    expect(rows).toEqual([
      { line: 2, values: { date: "2026-10-01", title: "Dinner, with friends", amount: "900" } },
      { line: 4, values: { date: "2026-10-02", title: "Tea", amount: "20" } },
    ]);
  });
});
