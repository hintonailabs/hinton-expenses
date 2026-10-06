import { describe, expect, it } from "vitest";
import { accountBalance, budgetUsedPercent, formatINR, signedAmount, sumAmounts } from "./money";

describe("sumAmounts", () => {
  it("adds numbers, not strings", () => {
    expect(sumAmounts([450, 500, 1200, 300])).toBe(2450);
  });
  it("avoids floating point drift", () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
  });
  it("returns 0 for nothing", () => {
    expect(sumAmounts([])).toBe(0);
  });
});

describe("signedAmount / accountBalance", () => {
  it("makes expenses negative", () => {
    expect(signedAmount({ amount: 100, type: "expense" })).toBe(-100);
    expect(signedAmount({ amount: 100, type: "income" })).toBe(100);
  });
  it("adds income and subtracts expenses from the opening balance", () => {
    const txs = [
      { amount: 65000, type: "income" as const },
      { amount: 18000, type: "expense" as const },
    ];
    expect(accountBalance(1000, txs)).toBe(48000);
  });
});

describe("budgetUsedPercent", () => {
  it("rounds to a whole percent and can exceed 100", () => {
    expect(budgetUsedPercent(1650, 8000)).toBe(21);
    expect(budgetUsedPercent(9000, 8000)).toBe(113);
  });
  it("is 0 when there is no limit", () => {
    expect(budgetUsedPercent(100, 0)).toBe(0);
  });
});

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(125000.5).replace(/\s/g, "")).toBe("₹1,25,000.50");
  });
});
