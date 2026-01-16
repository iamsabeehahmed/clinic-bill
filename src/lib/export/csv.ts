import { saveAs } from 'file-saver';
import { ExportColumn } from './excel';

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  // Create CSV header
  const headers = columns.map((col) => `"${col.header}"`).join(',');

  // Create CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Escape double quotes and wrap in quotes
        const stringValue = value !== null && value !== undefined ? String(value) : '';
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows].join('\n');

  // Create blob and save
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}
