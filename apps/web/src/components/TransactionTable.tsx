import type { Transaction } from "@hinton/shared";
import type { ReactNode } from "react";
import { formatDate, formatINR } from "../format";

export function TransactionTable({
  items,
  emptyMessage,
  renderActions,
}: {
  items: Transaction[];
  emptyMessage: ReactNode;
  renderActions?: (t: Transaction) => ReactNode;
}) {
  if (items.length === 0) return <p className="state">{emptyMessage}</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th>Category</th>
          <th>Account</th>
          <th>Method</th>
          <th className="num">Amount</th>
          {renderActions && <th />}
        </tr>
      </thead>
      <tbody>
        {items.map((t) => (
          <tr key={t.id}>
            <td>{formatDate(t.date)}</td>
            <td>{t.title}</td>
            <td>{t.categoryName}</td>
            <td>{t.accountName}</td>
            <td>{t.paymentMethod.toUpperCase()}</td>
            <td className={`num ${t.type}`}>
              {t.type === "income" ? "+" : "−"}
              {formatINR(t.amount)}
            </td>
            {renderActions && <td className="actions">{renderActions(t)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
