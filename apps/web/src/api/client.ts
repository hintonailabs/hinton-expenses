import type {
  Account,
  ApiErrorBody,
  BudgetRow,
  Category,
  Dashboard,
  ImportPreview,
  ImportResult,
  ListTransactionsQuery,
  Me,
  Transaction,
  TransactionInput,
  TransactionPage,
} from "@hinton/shared";

// The ONLY place in the web app that calls fetch. Components use the `api` object below.

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // Our api sends { error: { message } }; Better Auth sends { message }.
    const message = (data as ApiErrorBody | null)?.error?.message ?? (data as { message?: string } | null)?.message;
    throw new ApiError(response.status, message ?? `Request failed (${response.status})`);
  }
  return data as T;
}

function toQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export type TransactionListParams = Partial<Pick<ListTransactionsQuery, "q" | "from" | "to" | "sort" | "order" | "page" | "pageSize">>;

export const api = {
  // auth
  signUp: (name: string, email: string, password: string) => request<unknown>("POST", "/api/auth/sign-up/email", { name, email, password }),
  signIn: (email: string, password: string) => request<unknown>("POST", "/api/auth/sign-in/email", { email, password }),
  signOut: () => request<unknown>("POST", "/api/auth/sign-out", {}),
  me: () => request<Me>("GET", "/api/me"),

  // transactions
  listTransactions: (params: TransactionListParams) => request<TransactionPage>("GET", `/api/transactions${toQueryString(params)}`),
  createTransaction: (input: TransactionInput) => request<Transaction>("POST", "/api/transactions", input),
  updateTransaction: (id: string, input: TransactionInput) => request<Transaction>("PUT", `/api/transactions/${id}`, input),
  deleteTransaction: (id: string) => request<void>("DELETE", `/api/transactions/${id}`),

  // reference data
  listAccounts: () => request<Account[]>("GET", "/api/accounts"),
  listCategories: () => request<Category[]>("GET", "/api/categories"),
  listBudgets: () => request<BudgetRow[]>("GET", "/api/budgets"),
  saveBudget: (categoryId: string, monthlyLimit: number) => request<BudgetRow[]>("PUT", `/api/budgets/${categoryId}`, { monthlyLimit }),
  getDashboard: () => request<Dashboard>("GET", "/api/dashboard"),

  // CSV import
  previewImport: (csv: string) => request<ImportPreview>("POST", "/api/import/preview", { csv }),
  commitImport: (csv: string) => request<ImportResult>("POST", "/api/import/commit", { csv }),
};
