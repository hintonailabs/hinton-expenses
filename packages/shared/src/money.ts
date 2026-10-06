import type { TransactionType } from "./schemas";

// Money maths happens in whole paise (cents) so 0.1 + 0.2 never goes wrong.

export const toCents = (rupees: number) => Math.round(rupees * 100);
export const fromCents = (cents: number) => cents / 100;

export function sumAmounts(amounts: number[]): number {
  return fromCents(amounts.reduce((total, amount) => total + toCents(amount), 0));
}

/** Income counts as +, expense as -. Amounts themselves are always positive. */
export function signedAmount(t: { amount: number; type: TransactionType }): number {
  return t.type === "income" ? t.amount : -t.amount;
}

export function accountBalance(openingBalance: number, transactions: { amount: number; type: TransactionType }[]): number {
  return sumAmounts([openingBalance, ...transactions.map(signedAmount)]);
}

/** Percent of the budget used. Can go above 100 when overspent. */
export function budgetUsedPercent(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.round((toCents(spent) / toCents(limit)) * 100);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);
}
