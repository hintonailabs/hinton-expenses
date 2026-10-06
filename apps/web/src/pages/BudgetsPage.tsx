import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetUsedPercent, type BudgetRow } from "@hinton/shared";
import { useState } from "react";
import { api } from "../api/client";
import { QueryState } from "../components/QueryState";
import { formatINR } from "../format";

function BudgetCard({ row }: { row: BudgetRow }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(String(row.monthlyLimit ?? ""));
  const save = useMutation({
    mutationFn: () => api.saveBudget(row.categoryId, Number(limit)),
    onSuccess: () => {
      setEditing(false);
      return queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const percent = row.monthlyLimit ? budgetUsedPercent(row.spent, row.monthlyLimit) : 0;
  return (
    <div className="card">
      <div className="row between">
        <strong>{row.categoryName}</strong>
        <button className="link" onClick={() => setEditing(!editing)}>
          {row.monthlyLimit ? "Edit" : "Set budget"}
        </button>
      </div>
      {row.monthlyLimit ? (
        <>
          <div className="progress" title={`${percent}% used`}>
            <div className={percent > 100 ? "over" : percent >= 80 ? "warn" : ""} style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          <p className="muted">
            {formatINR(row.spent)} of {formatINR(row.monthlyLimit)} ({percent}%)
          </p>
        </>
      ) : (
        <p className="muted">No budget set. Spent {formatINR(row.spent)} this month.</p>
      )}
      {editing && (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <input type="number" min="1" step="1" value={limit} onChange={(e) => setLimit(e.target.value)} required />
          <button disabled={save.isPending}>Save</button>
          {save.error && <span className="error">{save.error.message}</span>}
        </form>
      )}
    </div>
  );
}

export function BudgetsPage() {
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: api.listBudgets });

  return (
    <>
      <h1>Budgets</h1>
      <p className="muted">Monthly limit per category, compared with what you have spent this month.</p>
      <QueryState isLoading={budgets.isLoading} error={budgets.error} isEmpty={budgets.data?.length === 0}>
        <div className="grid">{budgets.data?.map((row) => <BudgetCard key={row.categoryId} row={row} />)}</div>
      </QueryState>
    </>
  );
}
