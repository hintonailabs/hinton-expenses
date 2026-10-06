import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { api } from "../api/client";

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
      <h1>Import CSV</h1>
      <p className="muted">
        Columns: <code>date,title,amount,type,category,account,payment_method</code>. You will see a preview first; rows with problems are skipped.
      </p>
      <div className="card">
        <input type="file" accept=".csv,text/csv" onChange={onFile} />
        {preview.isPending && <p className="state">Checking {fileName}…</p>}
        {preview.error && <p className="error">{preview.error.message}</p>}
      </div>

      {result?.fileError && <p className="error">{result.fileError}</p>}

      {result && !result.fileError && (
        <div className="card">
          <p>
            <strong>{result.validCount}</strong> good rows, <strong className={result.invalidCount ? "expense" : ""}>{result.invalidCount}</strong> with problems
          </p>
          <table>
            <thead>
              <tr><th>Line</th><th>Date</th><th>Title</th><th>Amount</th><th>Category</th><th>Status</th></tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.line} className={row.errors.length ? "bad-row" : ""}>
                  <td>{row.line}</td>
                  <td>{row.raw.date}</td>
                  <td>{row.raw.title}</td>
                  <td>{row.raw.amount}</td>
                  <td>{row.raw.category}</td>
                  <td>{row.errors.length ? row.errors.join("; ") : "OK"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {commit.data ? (
            <p className="income">Imported {commit.data.imported} transactions ({commit.data.skipped} skipped).</p>
          ) : (
            <div className="row end">
              <button disabled={result.validCount === 0 || commit.isPending} onClick={() => commit.mutate()}>
                Import {result.validCount} good rows
              </button>
            </div>
          )}
          {commit.error && <p className="error">{commit.error.message}</p>}
        </div>
      )}
    </>
  );
}
