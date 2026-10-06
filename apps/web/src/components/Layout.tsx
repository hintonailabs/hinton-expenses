import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router";
import { api, ApiError } from "../api/client";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/transactions", label: "Transactions" },
  { to: "/accounts", label: "Accounts" },
  { to: "/budgets", label: "Budgets" },
  { to: "/import", label: "Import CSV" },
];

/** Wraps every page that needs a login. Not signed in? Go to /login. */
export function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: api.me });
  const signOut = useMutation({
    mutationFn: api.signOut,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
  });

  if (me.isLoading) return <p className="state">Loading…</p>;
  if (me.error instanceof ApiError && me.error.status === 401) return <Navigate to="/login" replace />;
  if (me.error) return <p className="state error">Could not reach the server: {me.error.message}</p>;

  return (
    <div className="shell">
      <header className="topbar">
        <strong className="brand">Hinton Expenses</strong>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <span className="who">{me.data?.email}</span>
        <button className="secondary" onClick={() => signOut.mutate()}>
          Sign out
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
