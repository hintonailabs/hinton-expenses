import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../api/client";

export function AuthPage({ mode }: { mode: "signin" | "signup" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = useMutation({
    mutationFn: () => (mode === "signup" ? api.signUp(name, email, password) : api.signIn(email, password)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submit.mutate();
  }

  return (
    <div className="auth">
      <form className="card" onSubmit={onSubmit}>
        <h1>Hinton Expenses</h1>
        <p className="muted">{mode === "signup" ? "Create your login" : "Welcome back"}</p>
        {mode === "signup" && (
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {submit.error && <p className="error">{submit.error.message}</p>}
        <button disabled={submit.isPending}>{mode === "signup" ? "Sign up" : "Sign in"}</button>
        <p className="muted">
          {mode === "signup" ? <Link to="/login">I already have a login</Link> : <Link to="/signup">Create a login</Link>}
        </p>
      </form>
    </div>
  );
}
