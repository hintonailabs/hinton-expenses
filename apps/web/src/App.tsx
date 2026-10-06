import { Navigate, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import { AccountsPage } from "./pages/AccountsPage";
import { AuthPage } from "./pages/AuthPage";
import { BudgetDrawerRoute, BudgetsPage } from "./pages/BudgetsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ImportPage } from "./pages/ImportPage";
import { TransactionDrawerRoute, TransactionsPage } from "./pages/TransactionsPage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="signin" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />

      {/* Everything below needs a login and shows the left navigation. */}
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />}>
          {/* These render inside the page as a right-hand drawer. */}
          <Route path="new" element={<TransactionDrawerRoute />} />
          <Route path=":id/edit" element={<TransactionDrawerRoute />} />
        </Route>
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="budgets" element={<BudgetsPage />}>
          <Route path=":categoryId/edit" element={<BudgetDrawerRoute />} />
        </Route>
        <Route path="import" element={<ImportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
