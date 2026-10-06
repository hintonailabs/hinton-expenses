import type { ReactNode } from "react";

/** Shows loading / error / empty messages, and only shows the page content when there is data. */
export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyMessage,
  children,
}: {
  isLoading: boolean;
  error: Error | null;
  isEmpty?: boolean;
  emptyMessage?: ReactNode;
  children: ReactNode;
}) {
  if (isLoading) return <p className="state">Loading…</p>;
  if (error) return <p className="state error">Something went wrong: {error.message}</p>;
  if (isEmpty) return <p className="state">{emptyMessage ?? "Nothing here yet."}</p>;
  return <>{children}</>;
}
