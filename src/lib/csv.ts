/**
 * Minimal CSV parser — handles quoted fields (with embedded commas/newlines) and
 * doubled-quote escaping (""), which covers what Excel/Sheets/Numbers export.
 * Returns an array of objects keyed by the header row.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n") {
      pushRow();
    } else if (char === "\r") {
      // skip; \n handles the row break
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) pushRow();

  const cleaned = rows.filter((r) => r.some((c) => c.trim().length > 0));
  if (cleaned.length === 0) return [];

  const headers = cleaned[0].map((h) => h.trim());
  return cleaned.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (r[i] ?? "").trim()));
    return obj;
  });
}
