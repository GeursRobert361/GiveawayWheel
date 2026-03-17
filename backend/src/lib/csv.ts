function escapeCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

export function buildCsv(rows: Array<Record<string, unknown>>, columns: string[]) {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((column) => escapeCsvCell(row[column])).join(","));
  return [header, ...lines].join("\n");
}
