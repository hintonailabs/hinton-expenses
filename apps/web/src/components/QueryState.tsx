import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Card, ErrorText } from "./ui";

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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
        <Loader2 className="animate-spin" size={20} /> Loading…
      </div>
    );
  }
  if (error) return <ErrorText>Something went wrong: {error.message}</ErrorText>;
  if (isEmpty) return <Card className="py-12 text-center text-slate-500">{emptyMessage ?? "Nothing here yet."}</Card>;
  return <>{children}</>;
}
