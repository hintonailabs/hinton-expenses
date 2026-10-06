import { useQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight, PiggyBank } from "lucide-react";
import { Link } from "react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api/client";
import { QueryState } from "../components/QueryState";
import { TransactionTable } from "../components/TransactionTable";
import { Card, PageHeader } from "../components/ui";
import { formatINR } from "../format";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <Card className="flex items-center gap-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
    </Card>
  );
}

const monthName = (month: string) => new Date(`${month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });
  const data = dashboard.data;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={data ? `Your money in ${monthName(data.month)}` : undefined} />
      <QueryState isLoading={dashboard.isLoading} error={dashboard.error}>
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Income" value={formatINR(data.income)} tone="bg-emerald-100 text-emerald-700" icon={<ArrowDownRight size={22} />} />
              <StatCard label="Expenses" value={formatINR(data.expense)} tone="bg-rose-100 text-rose-700" icon={<ArrowUpRight size={22} />} />
              <StatCard label="Saved" value={formatINR(data.income - data.expense)} tone="bg-brand-100 text-brand-700" icon={<PiggyBank size={22} />} />
            </div>

            <Card>
              <h2 className="mb-4 text-base font-semibold text-slate-900">Spending by category</h2>
              {data.byCategory.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No spending this month yet.</p>
              ) : (
                <div className="grid items-center gap-6 md:grid-cols-2">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={data.byCategory} dataKey="total" nameKey="categoryName" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {data.byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatINR(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="space-y-2.5">
                    {data.byCategory.map((c, i) => (
                      <li key={c.categoryId} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span className="size-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          {c.categoryName}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">{formatINR(c.total)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card flush>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Recent transactions</h2>
                <Link to="/transactions" className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link>
              </div>
              <TransactionTable items={data.recent} emptyMessage="No transactions yet." />
            </Card>
          </div>
        )}
      </QueryState>
    </>
  );
}
