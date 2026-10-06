import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { budgetUsedPercent } from "@hinton/shared";
import { Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router";
import { api } from "../api/client";
import { Drawer, DrawerBody, DrawerFooter } from "../components/Drawer";
import { QueryState } from "../components/QueryState";
import { Button, Card, ErrorText, Field, Input, PageHeader, cx } from "../components/ui";
import { formatINR } from "../format";

export function BudgetsPage() {
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: api.listBudgets });

  return (
    <>
      <PageHeader title="Budgets" subtitle="Monthly limit per category, compared with what you have spent this month." />
      <QueryState isLoading={budgets.isLoading} error={budgets.error} isEmpty={budgets.data?.length === 0}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.data?.map((row) => {
            const percent = row.monthlyLimit ? budgetUsedPercent(row.spent, row.monthlyLimit) : 0;
            return (
              <Card key={row.categoryId}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">{row.categoryName}</h2>
                  <Link
                    to={`/budgets/${row.categoryId}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
                  >
                    <Pencil size={14} /> {row.monthlyLimit ? "Edit" : "Set budget"}
                  </Link>
                </div>
                {row.monthlyLimit ? (
                  <>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100" title={`${percent}% used`}>
                      <div
                        className={cx("h-full rounded-full", percent > 100 ? "bg-red-500" : percent >= 80 ? "bg-amber-500" : "bg-emerald-500")}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-slate-600">
                        {formatINR(row.spent)} of {formatINR(row.monthlyLimit)}
                      </span>
                      <span className={cx("font-semibold", percent > 100 ? "text-red-600" : "text-slate-900")}>{percent}%</span>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No budget set. Spent {formatINR(row.spent)} this month.</p>
                )}
              </Card>
            );
          })}
        </div>
      </QueryState>
      <Outlet />
    </>
  );
}

/** /budgets/:categoryId/edit — a right-hand drawer with Save and Cancel. */
export function BudgetDrawerRoute() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const budgets = useQuery({ queryKey: ["budgets"], queryFn: api.listBudgets });
  const row = budgets.data?.find((b) => b.categoryId === categoryId);
  const [limit, setLimit] = useState<string | null>(null);
  const close = () => navigate("/budgets");

  const save = useMutation({
    mutationFn: () => api.saveBudget(categoryId!, Number(limit ?? row?.monthlyLimit)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["budgets"] });
      close();
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <Drawer title={row ? `${row.categoryName} budget` : "Budget"} onClose={close}>
      {!row ? (
        <div className="p-5">
          <QueryState isLoading={budgets.isLoading} error={budgets.error} isEmpty={!budgets.isLoading}>{null}</QueryState>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <DrawerBody>
            <p className="text-sm text-slate-500">You have spent {formatINR(row.spent)} on {row.categoryName} this month.</p>
            <Field label="Monthly limit (₹)">
              <Input
                type="number"
                min="1"
                step="1"
                autoFocus
                value={limit ?? String(row.monthlyLimit ?? "")}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
            </Field>
            {save.error && <ErrorText>{save.error.message}</ErrorText>}
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
            <Button disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </DrawerFooter>
        </form>
      )}
    </Drawer>
  );
}
