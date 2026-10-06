import { useQuery } from "@tanstack/react-query";
import { Banknote, CreditCard, Landmark, type LucideIcon } from "lucide-react";
import { api } from "../api/client";
import { QueryState } from "../components/QueryState";
import { Card, PageHeader, cx } from "../components/ui";
import { formatINR } from "../format";

const icons: Record<string, LucideIcon> = { Cash: Banknote, "Credit Card": CreditCard };

export function AccountsPage() {
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: api.listAccounts });

  return (
    <>
      <PageHeader title="Accounts" subtitle="Balance = opening balance + income − expenses" />
      <QueryState isLoading={accounts.isLoading} error={accounts.error} isEmpty={accounts.data?.length === 0}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.data?.map((account) => {
            const Icon = icons[account.name] ?? Landmark;
            return (
              <Card key={account.id} className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={24} />
                </span>
                <div>
                  <p className="text-sm text-slate-500">{account.name}</p>
                  <p className={cx("text-2xl font-bold tracking-tight", account.balance < 0 ? "text-rose-600" : "text-slate-900")}>
                    {formatINR(account.balance)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </QueryState>
    </>
  );
}
