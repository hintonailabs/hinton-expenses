import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, FileUp, LayoutDashboard, LogOut, Menu, PiggyBank, Wallet, X, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { api, ApiError } from "../api/client";
import { cx } from "./ui";

const links: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/budgets", label: "Budgets", icon: PiggyBank },
  { to: "/import", label: "Import CSV", icon: FileUp },
];

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]!.toUpperCase()).join("") || "?";

/** The signed-in shell: left navigation (user details at the bottom) + the page. */
export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const me = useQuery({ queryKey: ["me"], queryFn: api.me });
  const signOut = useMutation({
    mutationFn: api.signOut,
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
  });

  // On phones the menu slides over the page; close it after choosing a page.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (me.isLoading) return <p className="p-10 text-center text-slate-500">Loading…</p>;
  if (me.error instanceof ApiError && me.error.status === 401) return <Navigate to="/login" replace />;
  if (me.error) return <p className="p-10 text-center text-red-600">Could not reach the server: {me.error.message}</p>;

  return (
    <div className="min-h-screen">
      {/* Phone top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100">
          <Menu size={22} />
        </button>
        <span className="font-bold text-brand-700">Hinton Expenses</span>
      </header>

      {menuOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-lg font-bold text-white">₹</span>
            <span className="whitespace-nowrap text-lg font-bold tracking-tight text-slate-900">Hinton Expenses</span>
          </div>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Signed-in user */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {initials(me.data?.name ?? "")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{me.data?.name}</p>
              <p className="truncate text-xs text-slate-500">{me.data?.email}</p>
            </div>
            <button
              onClick={() => signOut.mutate()}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
