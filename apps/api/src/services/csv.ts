/** A small CSV reader: handles quoted values, commas inside quotes and Windows line endings. */
export function parseCsv(text: string): { header: string[]; rows: { line: number; values: Record<string, string> }[] } {
  const lines: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const endRow = () => {
    row.push(field);
    field = "";
    lines.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") endRow();
    else if (ch !== "\r") field += ch;
  }
  if (field !== "" || row.length > 0) endRow();

  const [headerRow = [], ...dataRows] = lines;
  const header = headerRow.map((h) => h.trim().toLowerCase());
  const rows = dataRows
    .map((cells, index) => ({ line: index + 2, cells }))
    .filter(({ cells }) => cells.some((c) => c.trim() !== "")) // skip blank lines
    .map(({ line, cells }) => ({ line, values: Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""])) }));
  return { header, rows };
}
