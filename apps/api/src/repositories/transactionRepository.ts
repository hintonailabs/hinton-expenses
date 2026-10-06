import { and, asc, desc, eq, gte, ilike, lte, sql, type SQL } from "drizzle-orm";
import { bankAccounts, categories, db, transactions } from "@hinton/db";
import type { ListTransactionsQuery, Transaction, TransactionInput } from "@hinton/shared";

export type TransactionFilters = Pick<ListTransactionsQuery, "q" | "from" | "to">;

/**
 * The WHERE clause for the transactions list.
 * The rows AND the summary (count + total) both use it, so they always agree.
 */
export function buildWhere(userId: string, filters: TransactionFilters): SQL {
  const conditions: SQL[] = [eq(transactions.userId, userId)];
  if (filters.q) conditions.push(ilike(transactions.title, `%${filters.q.replace(/[%_\\]/g, "\\$&")}%`));
  if (filters.from) conditions.push(gte(transactions.date, filters.from));
  if (filters.to) conditions.push(lte(transactions.date, filters.to));
  return and(...conditions)!;
}

const sortColumns = { date: transactions.date, amount: transactions.amount, title: transactions.title };

const selectColumns = {
  id: transactions.id,
  date: transactions.date,
  title: transactions.title,
  amount: transactions.amount,
  type: transactions.type,
  categoryId: transactions.categoryId,
  categoryName: categories.name,
  accountId: transactions.accountId,
  accountName: bankAccounts.name,
  paymentMethod: transactions.paymentMethod,
};

function selectWithNames() {
  return db
    .select(selectColumns)
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .innerJoin(bankAccounts, eq(bankAccounts.id, transactions.accountId));
}

export async function list(userId: string, query: ListTransactionsQuery) {
  const where = buildWhere(userId, query);
  const direction = query.order === "asc" ? asc : desc;

  const [items, [summary]] = await Promise.all([
    selectWithNames()
      .where(where)
      .orderBy(direction(sortColumns[query.sort]), desc(transactions.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
        total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number),
      })
      .from(transactions)
      .where(where),
  ]);

  return { items: items as Transaction[], summary: summary! };
}

export async function recent(userId: string, limit: number) {
  return (await selectWithNames()
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(limit)) as Transaction[];
}

export async function getById(userId: string, id: string) {
  const [row] = await selectWithNames().where(and(eq(transactions.userId, userId), eq(transactions.id, id)));
  return row as Transaction | undefined;
}

export async function create(userId: string, input: TransactionInput) {
  const [row] = await db.insert(transactions).values({ ...input, userId }).returning({ id: transactions.id });
  return row!.id;
}

export async function createMany(userId: string, inputs: TransactionInput[]) {
  if (inputs.length === 0) return;
  await db.insert(transactions).values(inputs.map((input) => ({ ...input, userId })));
}

export async function update(userId: string, id: string, input: TransactionInput) {
  const rows = await db
    .update(transactions)
    .set(input)
    .where(and(eq(transactions.userId, userId), eq(transactions.id, id)))
    .returning({ id: transactions.id });
  return rows.length > 0;
}

export async function remove(userId: string, id: string) {
  const rows = await db
    .delete(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.id, id)))
    .returning({ id: transactions.id });
  return rows.length > 0;
}

/** Income and expense totals between two dates (inclusive). */
export async function totalsByType(userId: string, from: string, to: string) {
  const rows = await db
    .select({ type: transactions.type, total: sql<number>`sum(${transactions.amount})`.mapWith(Number) })
    .from(transactions)
    .where(buildWhere(userId, { from, to }))
    .groupBy(transactions.type);
  const totalOf = (type: string) => rows.find((r) => r.type === type)?.total ?? 0;
  return { income: totalOf("income"), expense: totalOf("expense") };
}

/** Expense totals per category between two dates (inclusive). */
export async function expenseByCategory(userId: string, from: string, to: string) {
  return db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      total: sql<number>`sum(${transactions.amount})`.mapWith(Number),
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(buildWhere(userId, { from, to }), eq(transactions.type, "expense")))
    .groupBy(transactions.categoryId, categories.name)
    .orderBy(desc(sql`sum(${transactions.amount})`));
}
