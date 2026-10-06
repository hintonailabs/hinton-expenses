import { z } from "zod";

// Shared by the web app and the api, so both agree on the shape of the data.

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const PAYMENT_METHODS = ["upi", "card", "cash"] as const;
export const SORT_FIELDS = ["date", "amount", "title"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** True for real calendar dates written as YYYY-MM-DD (so 2026-02-31 is rejected). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const isoDateSchema = z.string().refine(isValidIsoDate, "Use a real date like 2026-10-07");

// ---------- Transactions ----------

export const transactionInputSchema = z.object({
  date: isoDateSchema,
  title: z.string().trim().min(1, "Title is required").max(100),
  // Amounts are always positive. `type` says whether it is income or expense.
  amount: z
    .number()
    .positive("Amount must be more than 0")
    .max(9_999_999_999)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, "Use at most 2 decimal places"),
  type: z.enum(TRANSACTION_TYPES),
  categoryId: z.string().uuid(),
  accountId: z.string().uuid(),
  paymentMethod: z.enum(PAYMENT_METHODS),
});
export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const listTransactionsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  sort: z.enum(SORT_FIELDS).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  amount: number; // always positive
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  paymentMethod: PaymentMethod;
};

export type TransactionPage = {
  items: Transaction[];
  page: number;
  pageSize: number;
  totalPages: number;
  summary: { count: number; total: number };
};

// ---------- Accounts, categories, budgets ----------

export type Account = { id: string; name: string; balance: number };
export type Category = { id: string; name: string; type: TransactionType };

export type BudgetRow = {
  categoryId: string;
  categoryName: string;
  monthlyLimit: number | null;
  spent: number;
};

export const budgetInputSchema = z.object({ monthlyLimit: z.number().positive().max(9_999_999_999) });

// ---------- Dashboard ----------

export type Dashboard = {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  byCategory: { categoryId: string; categoryName: string; total: number }[];
  recent: Transaction[];
};

// ---------- CSV import ----------

export const importRequestSchema = z.object({ csv: z.string().min(1, "The file is empty").max(1_000_000) });

export type ImportRowPreview = {
  line: number; // line number in the file (header is line 1)
  raw: Record<string, string>;
  errors: string[];
};
export type ImportPreview = { fileError: string | null; rows: ImportRowPreview[]; validCount: number; invalidCount: number };
export type ImportResult = { imported: number; skipped: number };

// ---------- Session / errors ----------

export type Me = { id: string; email: string; name: string };
export type ApiErrorBody = { error: { code: string; message: string; details?: unknown } };
