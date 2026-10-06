import { useQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../api/client";
import { QueryState } from "../components/QueryState";
import { TransactionTable } from "../components/TransactionTable";
import { formatINR } from "../format";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: api.getDashboard });
  const data = dashboard.data;

  return (
    <>
      <h1>Dashboard</h1>
      <QueryState isLoading={dashboard.isLoading} error={dashboard.error}>
        {data && (
          <>
            <p className="muted">This month ({data.month})</p>
            <div className="grid">
              <div className="card">
                <p className="muted">Income</p>
                <p className="big income">{formatINR(data.income)}</p>
              </div>
              <div className="card">
                <p className="muted">Expenses</p>
                <p className="big expense">{formatINR(data.expense)}</p>
              </div>
              <div className="card">
                <p className="muted">Saved</p>
                <p className="big">{formatINR(data.income - data.expense)}</p>
              </div>
            </div>

            <div className="card">
              <h2>Spending by category</h2>
              {data.byCategory.length === 0 ? (
                <p className="state">No spending this month yet.</p>
              ) : (
                <div className="chart">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={data.byCategory} dataKey="total" nameKey="categoryName" innerRadius={55} outerRadius={95}>
                        {data.byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatINR(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="legend">
                    {data.byCategory.map((c, i) => (
                      <li key={c.categoryId}>
                        <span className="dot" style={{ background: COLORS[i % COLORS.length] }} />
                        {c.categoryName} <strong>{formatINR(c.total)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="card">
              <h2>Recent transactions</h2>
              <TransactionTable items={data.recent} emptyMessage="No transactions yet." />
            </div>
          </>
        )}
      </QueryState>
    </>
  );
}
