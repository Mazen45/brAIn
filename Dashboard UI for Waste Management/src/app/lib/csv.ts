/** Shared CSV read/write helpers used by both the reports export and the
 * municipality's real-data import (depots/trucks/containers CSV upload). */

export function escapeCsvField(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function csvRow(fields: (string | number)[]): string {
  return fields.map(escapeCsvField).join(',');
}

/** Parses CSV text into rows of raw string fields, handling quoted fields
 * (including embedded commas/newlines/escaped quotes) - the minimum needed
 * to round-trip what a municipality's staff would paste in from Excel. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i++;
    } else if (char === ',') {
      row.push(field);
      field = '';
      i++;
    } else if (char === '\n' || char === '\r') {
      row.push(field);
      field = '';
      if (row.some((f) => f.trim().length > 0)) rows.push(row);
      row = [];
      if (char === '\r' && text[i + 1] === '\n') i++;
      i++;
    } else {
      field += char;
      i++;
    }
  }

  row.push(field);
  if (row.some((f) => f.trim().length > 0)) rows.push(row);

  return rows;
}

/** Parses CSV rows into header-keyed records (headers lowercased/trimmed),
 * so column order in the uploaded file doesn't matter. */
export function csvRowsToRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? '').trim();
    });
    return record;
  });
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob(['﻿' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
