import {
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  isValidIsoDate,
  type ImportPreview,
  type ImportResult,
  type TransactionInput,
} from "@hinton/shared";
import * as reference from "../repositories/referenceRepository";
import * as repo from "../repositories/transactionRepository";
import { parseCsv } from "./csv";

const REQUIRED_COLUMNS = ["date", "title", "amount", "type", "category", "account", "payment_method"];

type Lookups = { categories: Map<string, string>; accounts: Map<string, string> };

/** Checks one CSV row. Returns the clean transaction, or a list of what is wrong. */
function checkRow(raw: Record<string, string>, lookups: Lookups): { input?: TransactionInput; errors: string[] } {
  const errors: string[] = [];

  const date = raw.date?.trim() ?? "";
  if (!isValidIsoDate(date)) errors.push(`Bad date "${date}" (use YYYY-MM-DD)`);

  const title = raw.title?.trim() ?? "";
  if (!title) errors.push("Title is empty");

  // People paste "₹1,200" from bank statements, so tidy that up before checking.
  const amountText = (raw.amount ?? "").replace(/[₹,\s]/g, "");
  const amount = amountText === "" ? NaN : Number(amountText);
  if (Number.isNaN(amount)) errors.push(`Amount "${raw.amount ?? ""}" is not a number`);
  else if (amount <= 0) errors.push(`Amount "${raw.amount}" must be more than 0`);
  else if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-6) errors.push(`Amount "${raw.amount}" has more than 2 decimals`);

  const type = (raw.type ?? "").trim().toLowerCase();
  if (!(TRANSACTION_TYPES as readonly string[]).includes(type)) errors.push(`Type "${raw.type ?? ""}" must be income or expense`);

  const categoryId = lookups.categories.get((raw.category ?? "").trim().toLowerCase());
  if (!categoryId) errors.push(`Unknown category "${raw.category ?? ""}"`);

  const accountId = lookups.accounts.get((raw.account ?? "").trim().toLowerCase());
  if (!accountId) errors.push(`Unknown account "${raw.account ?? ""}"`);

  const paymentMethod = (raw.payment_method ?? "").trim().toLowerCase();
  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) errors.push(`Payment method "${raw.payment_method ?? ""}" must be upi, card or cash`);

  if (errors.length > 0) return { errors };
  return { errors, input: { date, title, amount, type, categoryId, accountId, paymentMethod } as TransactionInput };
}

async function checkCsv(userId: string, csv: string) {
  const [categories, accounts] = await Promise.all([reference.listCategories(userId), reference.listAccountsWithBalance(userId)]);
  const lookups: Lookups = {
    categories: new Map(categories.map((c) => [c.name.toLowerCase(), c.id])),
    accounts: new Map(accounts.map((a) => [a.name.toLowerCase(), a.id])),
  };

  const { header, rows } = parseCsv(csv);
  const missing = REQUIRED_COLUMNS.filter((col) => !header.includes(col));
  if (missing.length > 0) {
    return { fileError: `Missing column(s): ${missing.join(", ")}`, results: [] };
  }
  const results = rows.map((row) => ({ line: row.line, raw: row.values, ...checkRow(row.values, lookups) }));
  return { fileError: null, results };
}

export async function previewImport(userId: string, csv: string): Promise<ImportPreview> {
  const { fileError, results } = await checkCsv(userId, csv);
  const rows = results.map(({ line, raw, errors }) => ({ line, raw, errors }));
  const invalidCount = rows.filter((r) => r.errors.length > 0).length;
  return { fileError, rows, validCount: rows.length - invalidCount, invalidCount };
}

/** Re-checks the file on the server (never trust the browser) and saves only the good rows. */
export async function commitImport(userId: string, csv: string): Promise<ImportResult> {
  const { results } = await checkCsv(userId, csv);
  const good = results.flatMap((r) => (r.input ? [r.input] : []));
  await repo.createMany(userId, good);
  return { imported: good.length, skipped: results.length - good.length };
}
