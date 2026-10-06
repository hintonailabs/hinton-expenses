import type { Transaction } from "@hinton/shared";
import type { ReactNode } from "react";
import { formatDate, formatINR } from "../format";
import { cx } from "./ui";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";

export function TransactionTable({
  items,
  emptyMessage,
  renderActions,
}: {
  items: Transaction[];
  emptyMessage: ReactNode;
  renderActions?: (t: Transaction) => ReactNode;
}) {
  if (items.length === 0) return <p className="px-4 py-12 text-center text-sm text-slate-500">{emptyMessage}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className={cx(th, "hidden sm:table-cell")}>Date</th>
            <th className={th}>Title</th>
            <th className={cx(th, "hidden sm:table-cell")}>Category</th>
            <th className={cx(th, "hidden md:table-cell")}>Account</th>
            <th className={cx(th, "hidden md:table-cell")}>Method</th>
            <th className={cx(th, "text-right")}>Amount</th>
            {renderActions && <th className={th} />}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/60">
              <td className="hidden whitespace-nowrap px-4 py-3 text-slate-500 sm:table-cell">{formatDate(t.date)}</td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {t.title}
                <span className="block text-xs font-normal text-slate-500 sm:hidden">{formatDate(t.date)} · {t.categoryName}</span>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">{t.categoryName}</span>
              </td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{t.accountName}</td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{t.paymentMethod.toUpperCase()}</td>
              <td className={cx("whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums", t.type === "income" ? "text-emerald-600" : "text-slate-900")}>
                {t.type === "income" ? "+" : "−"}
                {formatINR(t.amount)}
              </td>
              {renderActions && <td className="whitespace-nowrap px-2 py-3 text-right sm:px-4">{renderActions(t)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
