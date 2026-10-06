import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Db } from "./client";
import { bankAccounts, budgets, categories, transactions } from "./schema";
import { ACCOUNTS, BUDGETS, CATEGORIES, buildSeedTransactions } from "./seed-data";

/** Gives a new user the sample accounts, categories, budgets and transactions. */
export async function seedUserData(db: Db, userId: string, today: Date = new Date()) {
  // Ids are made here (not by the database) so everything can go in one batch.
  const accountIds = new Map(ACCOUNTS.map((a) => [a.name, randomUUID()]));
  const categoryIds = new Map(CATEGORIES.map((c) => [c.name, randomUUID()]));

  await db.batch([
    db.insert(bankAccounts).values(ACCOUNTS.map((a) => ({ id: accountIds.get(a.name)!, userId, ...a }))),
    db.insert(categories).values(CATEGORIES.map((c) => ({ id: categoryIds.get(c.name)!, userId, ...c }))),
    db.insert(budgets).values(
      Object.entries(BUDGETS).map(([name, monthlyLimit]) => ({ userId, categoryId: categoryIds.get(name)!, monthlyLimit })),
    ),
    db.insert(transactions).values(
      buildSeedTransactions(today).map(({ category, account, ...t }) => ({
        userId,
        ...t,
        categoryId: categoryIds.get(category)!,
        accountId: accountIds.get(account)!,
      })),
    ),
  ]);
}

/** Seeds only if this user has no accounts yet, so it is safe to call on every sign-in. */
export async function ensureSeeded(db: Db, userId: string) {
  const existing = await db.select({ id: bankAccounts.id }).from(bankAccounts).where(eq(bankAccounts.userId, userId)).limit(1);
  if (existing.length === 0) await seedUserData(db, userId);
}
