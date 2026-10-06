import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { QueryState } from "../components/QueryState";
import { formatINR } from "../format";

export function AccountsPage() {
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: api.listAccounts });

  return (
    <>
      <h1>Accounts</h1>
      <QueryState isLoading={accounts.isLoading} error={accounts.error} isEmpty={accounts.data?.length === 0}>
        <div className="grid">
          {accounts.data?.map((account) => (
            <div className="card" key={account.id}>
              <p className="muted">{account.name}</p>
              <p className={`big ${account.balance < 0 ? "expense" : ""}`}>{formatINR(account.balance)}</p>
            </div>
          ))}
        </div>
      </QueryState>
    </>
  );
}
