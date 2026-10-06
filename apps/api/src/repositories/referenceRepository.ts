import { and, eq, sql } from "drizzle-orm";
import { bankAccounts, budgets, categories, db, transactions } from "@hinton/db";
import type { Account, Category } from "@hinton/shared";

export async function listCategories(userId: string): Promise<Category[]> {
  return db.select({ id: categories.id, name: categories.name, type: categories.type }).from(categories).where(eq(categories.userId, userId)).orderBy(categories.type, categories.name);
}

/** Balance = opening balance + income - expenses, worked out in the database. */
export async function listAccountsWithBalance(userId: string): Promise<Account[]> {
  return db
    .select({
      id: bankAccounts.id,
      name: bankAccounts.name,
      balance: sql<number>`${bankAccounts.openingBalance} + coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else -${transactions.amount} end), 0)`.mapWith(Number),
    })
    .from(bankAccounts)
    .leftJoin(transactions, eq(transactions.accountId, bankAccounts.id))
    .where(eq(bankAccounts.userId, userId))
    .groupBy(bankAccounts.id)
    .orderBy(bankAccounts.name);
}

export async function listBudgets(userId: string) {
  return db.select({ categoryId: budgets.categoryId, monthlyLimit: budgets.monthlyLimit }).from(budgets).where(eq(budgets.userId, userId));
}

export async function saveBudget(userId: string, categoryId: string, monthlyLimit: number) {
  await db
    .insert(budgets)
    .values({ userId, categoryId, monthlyLimit })
    .onConflictDoUpdate({ target: [budgets.userId, budgets.categoryId], set: { monthlyLimit } });
}

export async function ownsAccount(userId: string, id: string) {
  const rows = await db.select({ id: bankAccounts.id }).from(bankAccounts).where(and(eq(bankAccounts.userId, userId), eq(bankAccounts.id, id)));
  return rows.length > 0;
}

export async function ownsCategory(userId: string, id: string) {
  const rows = await db.select({ id: categories.id }).from(categories).where(and(eq(categories.userId, userId), eq(categories.id, id)));
  return rows.length > 0;
}
