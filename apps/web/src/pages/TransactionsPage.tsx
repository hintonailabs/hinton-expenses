import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction } from "@hinton/shared";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { api, type TransactionListParams } from "../api/client";
import { QueryState } from "../components/QueryState";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionTable } from "../components/TransactionTable";
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
  const [search, setSearch] = useSearchParams();
  const params = readParams(search);
  const [editing, setEditing] = useState<Transaction | "new" | null>(null);

  const transactions = useQuery({ queryKey: ["transactions", params], queryFn: () => api.listTransactions(params) });
  const remove = useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => queryClient.invalidateQueries(),
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
      <div className="row between">
        <h1>Transactions</h1>
        <button onClick={() => setEditing("new")}>+ Add transaction</button>
      </div>

      <div className="card filters">
        <form className="row" onSubmit={onSearch}>
          <input name="q" key={params.q ?? ""} defaultValue={params.q ?? ""} placeholder="Search by title" />
          <button className="secondary">Search</button>
        </form>
        <label>From<input type="date" value={params.from ?? ""} onChange={(e) => updateParams({ from: e.target.value })} /></label>
        <label>To<input type="date" value={params.to ?? ""} onChange={(e) => updateParams({ to: e.target.value })} /></label>
        <label>
          Sort by
          <select value={params.sort} onChange={(e) => updateParams({ sort: e.target.value })}>
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="title">Title</option>
          </select>
        </label>
        <button className="secondary" onClick={() => updateParams({ order: params.order === "asc" ? "desc" : "asc" })}>
          {params.order === "asc" ? "↑ Ascending" : "↓ Descending"}
        </button>
        <button className="link" onClick={() => setSearch(new URLSearchParams())}>Clear</button>
      </div>

      <QueryState isLoading={transactions.isLoading} error={transactions.error}>
        {data && (
          <>
            <div className="summary" aria-label="Summary">
              <span><strong>{data.summary.count}</strong> transactions</span>
              <span>Total: <strong>{formatINR(data.summary.total)}</strong></span>
            </div>
            <div className="card flush">
              <TransactionTable
                items={data.items}
                emptyMessage="No transactions found."
                renderActions={(t) => (
                  <>
                    <button className="link" onClick={() => setEditing(t)}>Edit</button>
                    <button className="link danger" onClick={() => window.confirm(`Delete "${t.title}"?`) && remove.mutate(t.id)}>Delete</button>
                  </>
                )}
              />
            </div>
            {remove.error && <p className="error">{remove.error.message}</p>}
            <div className="row pager">
              <button className="secondary" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>← Previous</button>
              <span>Page {data.page} of {data.totalPages}</span>
              <button className="secondary" disabled={page >= data.totalPages} onClick={() => updateParams({ page: String(page + 1) })}>Next →</button>
            </div>
          </>
        )}
      </QueryState>

      {editing && <TransactionForm existing={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
