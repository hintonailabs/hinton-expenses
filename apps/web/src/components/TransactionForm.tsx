import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PAYMENT_METHODS, type Transaction, type TransactionInput } from "@hinton/shared";
import { useState, type FormEvent } from "react";
import { api } from "../api/client";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

/** Add (no `existing`) or edit (with `existing`) a transaction, in a pop-up. */
export function TransactionForm({ existing, onClose }: { existing?: Transaction; onClose: () => void }) {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["categories"], queryFn: api.listCategories });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: api.listAccounts });

  const [type, setType] = useState(existing?.type ?? "expense");
  const [form, setForm] = useState({
    date: existing?.date ?? today(),
    title: existing?.title ?? "",
    amount: existing ? String(existing.amount) : "",
    categoryId: existing?.categoryId ?? "",
    accountId: existing?.accountId ?? "",
    paymentMethod: existing?.paymentMethod ?? "upi",
  });
  const set = (field: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [field]: e.target.value });

  const save = useMutation({
    mutationFn: () => {
      const input = { ...form, amount: Number(form.amount), type } as TransactionInput;
      return existing ? api.updateTransaction(existing.id, input) : api.createTransaction(input);
    },
    onSuccess: async () => {
      // Anything that shows money must refresh after a change.
      await queryClient.invalidateQueries();
      onClose();
    },
  });

  const categoryChoices = categories.data?.filter((c) => c.type === type) ?? [];

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="card modal" onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}>
        <h2>{existing ? "Edit transaction" : "Add transaction"}</h2>
        <div className="segmented">
          {(["expense", "income"] as const).map((t) => (
            <button type="button" key={t} className={type === t ? "active" : ""} onClick={() => { setType(t); setForm({ ...form, categoryId: "" }); }}>
              {t === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>
        <label>Title<input value={form.title} onChange={set("title")} required maxLength={100} /></label>
        <div className="row">
          <label>Amount (₹)<input type="number" min="0.01" step="0.01" value={form.amount} onChange={set("amount")} required /></label>
          <label>Date<input type="date" value={form.date} onChange={set("date")} required /></label>
        </div>
        <label>
          Category
          <select value={form.categoryId} onChange={set("categoryId")} required>
            <option value="">Choose…</option>
            {categoryChoices.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="row">
          <label>
            Account
            <select value={form.accountId} onChange={set("accountId")} required>
              <option value="">Choose…</option>
              {accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label>
            Payment method
            <select value={form.paymentMethod} onChange={set("paymentMethod")}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
          </label>
        </div>
        {save.error && <p className="error">{save.error.message}</p>}
        <div className="row end">
          <button type="button" className="secondary" onClick={onClose}>Cancel</button>
          <button disabled={save.isPending}>{existing ? "Save changes" : "Add"}</button>
        </div>
      </form>
    </div>
  );
}
