import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * A panel that slides in from the right. Click the dark area or press Esc to close.
 * Put a <form className="flex min-h-0 flex-1 flex-col"> inside: scrolling body + footer buttons.
 */
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </header>
        {children}
      </aside>
    </div>
  );
}

export function DrawerBody({ children }: { children: ReactNode }) {
  return <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">{children}</div>;
}

export function DrawerFooter({ children }: { children: ReactNode }) {
  return <footer className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">{children}</footer>;
}
