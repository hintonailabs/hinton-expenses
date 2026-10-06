import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { api, type TransactionListParams } from "../api/client";
import { QueryState } from "../components/QueryState";
import { TransactionDrawer } from "../components/TransactionDrawer";
import { TransactionTable } from "../components/TransactionTable";
import { Button, Card, Field, Input, PageHeader, Select } from "../components/ui";
import { formatINR } from "../format";

/** The filters live in the URL (?q=...&from=...), so a page can be shared or refreshed. */
function readParams(search: URLSearchParams): TransactionListParams {
  return {
    q: search.get("q") ?? undefined,
    from: search.get("from") ?? undefined,
    to: search.get("to") ?? undefined,
    sort: (search.get("sort") as TransactionListParams["sort"]) ?? "date",
    order: (search.get("order") as TransactionListParams["order"]) ?? "desc",
    page: Number(search.get("page") ?? 1),
  };
}

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const { search: queryString } = useLocation();
  const [search, setSearch] = useSearchParams();
  const params = readParams(search);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const transactions = useQuery({ queryKey: ["transactions", params], queryFn: () => api.listTransactions(params) });
  const remove = useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => {
      setConfirmingId(null);
      return queryClient.invalidateQueries();
    },
  });

  /** Changes some filters and goes back to page 1 (unless the change is the page itself). */
  function updateParams(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(search);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setSearch(next);
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParams({ q: String(new FormData(event.currentTarget).get("q") ?? "").trim() });
  }

  const data = transactions.data;
  const page = params.page ?? 1;

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Search, filter and manage everything you have spent or earned."
        actions={
          <Link
            to={`/transactions/new${queryString}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Add transaction
          </Link>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <form onSubmit={onSearch} className="flex gap-2 sm:col-span-2 lg:col-span-4">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input name="q" key={params.q ?? ""} defaultValue={params.q ?? ""} placeholder="Search by title" className="pl-9" aria-label="Search by title" />
            </div>
            <Button variant="secondary">Search</Button>
          </form>
          <Field label="From" className="lg:col-span-2">
            <Input type="date" value={params.from ?? ""} onChange={(e) => updateParams({ from: e.target.value })} />
          </Field>
          <Field label="To" className="lg:col-span-2">
            <Input type="date" value={params.to ?? ""} onChange={(e) => updateParams({ to: e.target.value })} />
          </Field>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
            <Field label="Sort by" className="flex-1">
              <Select value={params.sort} onChange={(e) => updateParams({ sort: e.target.value })}>
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
              </Select>
            </Field>
            <Button variant="secondary" onClick={() => updateParams({ order: params.order === "asc" ? "desc" : "asc" })} aria-label="Toggle sort order">
              {params.order === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {params.order === "asc" ? "Asc" : "Desc"}
            </Button>
            <Button variant="ghost" onClick={() => setSearch(new URLSearchParams())}>Clear</Button>
          </div>
        </div>
      </Card>

      <QueryState isLoading={transactions.isLoading} error={transactions.error}>
        {data && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 px-1 text-sm text-slate-500" aria-label="Summary">
              <span><strong className="text-slate-900">{data.summary.count}</strong> transactions</span>
              <span>Total: <strong className="text-slate-900">{formatINR(data.summary.total)}</strong></span>
            </div>
            <Card flush className="overflow-hidden">
              <TransactionTable
                items={data.items}
                emptyMessage="No transactions found."
                renderActions={(t) =>
                  confirmingId === t.id ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs text-slate-500">Delete?</span>
                      <Button variant="danger" className="px-2.5 py-1" disabled={remove.isPending} onClick={() => remove.mutate(t.id)}>Yes</Button>
                      <Button variant="secondary" className="px-2.5 py-1" onClick={() => setConfirmingId(null)}>No</Button>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Link to={`/transactions/${t.id}/edit${queryString}`} aria-label={`Edit ${t.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => setConfirmingId(t.id)} aria-label={`Delete ${t.title}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </span>
                  )
                }
              />
            </Card>
            {remove.error && <p className="mt-2 text-sm text-red-600">{remove.error.message}</p>}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <Button variant="secondary" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>← Previous</Button>
              <span className="text-slate-600">Page {data.page} of {data.totalPages}</span>
              <Button variant="secondary" disabled={page >= data.totalPages} onClick={() => updateParams({ page: String(page + 1) })}>Next →</Button>
            </div>
          </>
        )}
      </QueryState>

      {/* The add / edit drawer (/transactions/new and /transactions/:id/edit) */}
      <Outlet />
    </>
  );
}

/** Rendered by the /new and /:id/edit routes. Closing goes back to the list, keeping the filters. */
export function TransactionDrawerRoute() {
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const close = () => navigate(`/transactions${search}`);

  const existing = useQuery({ queryKey: ["transaction", id], queryFn: () => api.getTransaction(id!), enabled: !!id });

  if (!id) return <TransactionDrawer onClose={close} />;
  if (existing.data) return <TransactionDrawer existing={existing.data} onClose={close} />;
  return null; // still loading (or not found): show nothing until we have the transaction
}
