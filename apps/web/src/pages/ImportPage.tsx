import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileUp, XCircle } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { api } from "../api/client";
import { Button, Card, ErrorText, PageHeader, cx } from "../components/ui";

export function ImportPage() {
  const queryClient = useQueryClient();
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");

  const preview = useMutation({ mutationFn: api.previewImport });
  const commit = useMutation({
    mutationFn: () => api.commitImport(csv),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    setFileName(file.name);
    commit.reset();
    preview.mutate(text);
  }

  const result = preview.data;
  return (
    <>
      <PageHeader title="Import CSV" subtitle="Upload a file, check the preview, then import. Rows with problems are skipped." />

      <Card className="mb-6">
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-10 text-center hover:border-brand-500 hover:bg-brand-50/40">
          <FileUp className="text-brand-600" size={28} />
          <span className="font-medium text-slate-900">{fileName || "Choose a CSV file"}</span>
          <span className="text-sm text-slate-500">
            Columns: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">date,title,amount,type,category,account,payment_method</code>
          </span>
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="sr-only" />
        </label>
        {preview.isPending && <p className="mt-3 text-sm text-slate-500">Checking {fileName}…</p>}
        {preview.error && <div className="mt-3"><ErrorText>{preview.error.message}</ErrorText></div>}
      </Card>

      {result?.fileError && <ErrorText>{result.fileError}</ErrorText>}

      {result && !result.fileError && (
        <Card flush>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <p className="text-sm text-slate-600">
              <strong className="text-emerald-600">{result.validCount}</strong> good rows ·{" "}
              <strong className={result.invalidCount ? "text-red-600" : "text-slate-900"}>{result.invalidCount}</strong> with problems
            </p>
            {commit.data ? (
              <p className="text-sm font-medium text-emerald-600">Imported {commit.data.imported} transactions ({commit.data.skipped} skipped).</p>
            ) : (
              <Button disabled={result.validCount === 0 || commit.isPending} onClick={() => commit.mutate()}>
                {commit.isPending ? "Importing…" : `Import ${result.validCount} good rows`}
              </Button>
            )}
          </div>
          {commit.error && <div className="px-5 pb-4"><ErrorText>{commit.error.message}</ErrorText></div>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Line</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Amount</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.rows.map((row) => {
                  const bad = row.errors.length > 0;
                  return (
                    <tr key={row.line} className={cx(bad && "bg-red-50")}>
                      <td className="px-4 py-3 text-slate-500">{row.line}</td>
                      <td className="whitespace-nowrap px-4 py-3">{row.raw.date}</td>
                      <td className="px-4 py-3">{row.raw.title}</td>
                      <td className="px-4 py-3">{row.raw.amount}</td>
                      <td className="px-4 py-3">{row.raw.category}</td>
                      <td className="px-4 py-3">
                        {bad ? (
                          <span className="flex items-start gap-1.5 text-red-700"><XCircle size={16} className="mt-0.5 shrink-0" />{row.errors.join("; ")}</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 size={16} />OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
