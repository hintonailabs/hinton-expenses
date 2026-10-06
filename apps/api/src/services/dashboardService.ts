import type { BudgetRow, Dashboard } from "@hinton/shared";
import * as reference from "../repositories/referenceRepository";
import * as repo from "../repositories/transactionRepository";
import { currentMonth, monthRange } from "./dateRange";

export async function getDashboard(userId: string, month = currentMonth()): Promise<Dashboard> {
  const { from, to } = monthRange(month);
  const [totals, byCategory, recent] = await Promise.all([
    repo.totalsByType(userId, from, to),
    repo.expenseByCategory(userId, from, to),
    repo.recent(userId, 5),
  ]);
  return { month, ...totals, byCategory, recent };
}

/** One row per expense category: its limit (if any) and what was spent this month. */
export async function getBudgets(userId: string, month = currentMonth()): Promise<BudgetRow[]> {
  const { from, to } = monthRange(month);
  const [categories, limits, spending] = await Promise.all([
    reference.listCategories(userId),
    reference.listBudgets(userId),
    repo.expenseByCategory(userId, from, to),
  ]);
  return categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      monthlyLimit: limits.find((l) => l.categoryId === c.id)?.monthlyLimit ?? null,
      spent: spending.find((s) => s.categoryId === c.id)?.total ?? 0,
    }));
}
