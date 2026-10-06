import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, ShieldCheck, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../api/client";
import { Button, ErrorText, Field, Input } from "../components/ui";

const highlights = [
  { icon: BarChart3, text: "See where your money goes, month by month" },
  { icon: ShieldCheck, text: "Budgets that warn you before you overspend" },
  { icon: Upload, text: "Import bank statements from a CSV file" },
];

/** Left half: branding. Right half: the form. On phones the branding becomes a slim header. */
export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignUp = mode === "signup";

  const submit = useMutation({
    mutationFn: () => (isSignUp ? api.signUp(name, email, password) : api.signIn(email, password)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/dashboard");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submit.mutate();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-linear-to-br from-brand-900 via-brand-700 to-brand-500 p-6 text-white sm:p-10 lg:p-14">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-xl font-bold ring-1 ring-white/30">₹</span>
          <span className="text-xl font-bold tracking-tight">Hinton Expenses</span>
        </div>
        <div className="hidden lg:block">
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">Know where every rupee goes.</h2>
          <p className="mt-4 max-w-md text-lg text-indigo-100">A simple personal expense tracker for your accounts, budgets and everyday spending.</p>
          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-indigo-50">
                <span className="grid size-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/20">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="hidden text-sm text-indigo-200 lg:block">A practice project by Hinton AI Labs · fictional sample data</p>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{isSignUp ? "Create your account" : "Welcome back"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {isSignUp ? "Sign up to start tracking. We will add sample data so you can explore." : "Sign in to see your expenses."}
            </p>
          </div>
          {isSignUp && (
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
            </Field>
          )}
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
            />
            {isSignUp && <span className="mt-1 block text-xs text-slate-500">At least 8 characters.</span>}
          </Field>
          {submit.error && <ErrorText>{submit.error.message}</ErrorText>}
          <Button className="w-full" disabled={submit.isPending}>
            {submit.isPending ? "Please wait…" : isSignUp ? "Sign up" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            {isSignUp ? "Already have an account? " : "New here? "}
            <Link to={isSignUp ? "/login" : "/signup"} className="font-semibold text-brand-600 hover:text-brand-700">
              {isSignUp ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
