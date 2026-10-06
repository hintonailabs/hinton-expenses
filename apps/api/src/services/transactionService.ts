import type { ListTransactionsQuery, TransactionInput, TransactionPage } from "@hinton/shared";
import { AppError, notFound } from "../errors";
import * as reference from "../repositories/referenceRepository";
import * as repo from "../repositories/transactionRepository";

export async function listTransactions(userId: string, query: ListTransactionsQuery): Promise<TransactionPage> {
  const { items, summary } = await repo.list(userId, query);
  return {
    items,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(summary.count / query.pageSize)),
    summary,
  };
}

// A user must only be able to point at their own account and category.
async function checkOwnership(userId: string, input: TransactionInput) {
  const [okAccount, okCategory] = await Promise.all([
    reference.ownsAccount(userId, input.accountId),
    reference.ownsCategory(userId, input.categoryId),
  ]);
  if (!okAccount) throw new AppError(400, "invalid_account", "Unknown account");
  if (!okCategory) throw new AppError(400, "invalid_category", "Unknown category");
}

export async function getTransaction(userId: string, id: string) {
  const transaction = await repo.getById(userId, id);
  if (!transaction) throw notFound("Transaction");
  return transaction;
}

export async function createTransaction(userId: string, input: TransactionInput) {
  await checkOwnership(userId, input);
  const id = await repo.create(userId, input);
  return (await repo.getById(userId, id))!;
}

export async function updateTransaction(userId: string, id: string, input: TransactionInput) {
  await checkOwnership(userId, input);
  if (!(await repo.update(userId, id, input))) throw notFound("Transaction");
  return (await repo.getById(userId, id))!;
}

export async function deleteTransaction(userId: string, id: string) {
  if (!(await repo.remove(userId, id))) throw notFound("Transaction");
}
