import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PAYMENT_METHODS, type Transaction, type TransactionInput, type TransactionType } from "@hinton/shared";
import { useState, type FormEvent } from "react";
import { api } from "../api/client";
import { Drawer, DrawerBody, DrawerFooter } from "./Drawer";
import { Button, ErrorText, Field, Input, Select, cx } from "./ui";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

/** Add (no `existing`) or edit (with `existing`) a transaction in a right-hand drawer. */
export function TransactionDrawer({ existing, onClose }: { existing?: Transaction; onClose: () => void }) {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["categories"], queryFn: api.listCategories });
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: api.listAccounts });

  const [type, setType] = useState<TransactionType>(existing?.type ?? "expense");
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
    <Drawer title={existing ? "Edit transaction" : "Add transaction"} onClose={onClose}>
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <DrawerBody>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => {
                  setType(t);
                  setForm({ ...form, categoryId: "" });
                }}
                className={cx(
                  "rounded-md py-1.5 text-sm font-semibold transition",
                  type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {t === "expense" ? "Expense" : "Income"}
              </button>
            ))}
          </div>
          <Field label="Title">
            <Input value={form.title} onChange={set("title")} required maxLength={100} autoFocus placeholder="e.g. Biryani" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (₹)">
              <Input type="number" min="0.01" step="0.01" value={form.amount} onChange={set("amount")} required />
            </Field>
            <Field label="Date">
              <Input type="date" value={form.date} onChange={set("date")} required />
            </Field>
          </div>
          <Field label="Category">
            <Select value={form.categoryId} onChange={set("categoryId")} required>
              <option value="">Choose…</option>
              {categoryChoices.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Account">
              <Select value={form.accountId} onChange={set("accountId")} required>
                <option value="">Choose…</option>
                {accounts.data?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Payment method">
              <Select value={form.paymentMethod} onChange={set("paymentMethod")}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m.toUpperCase()}</option>
                ))}
              </Select>
            </Field>
          </div>
          {save.error && <ErrorText>{save.error.message}</ErrorText>}
        </DrawerBody>
        <DrawerFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={save.isPending}>{save.isPending ? "Saving…" : existing ? "Save changes" : "Add transaction"}</Button>
        </DrawerFooter>
      </form>
    </Drawer>
  );
}
