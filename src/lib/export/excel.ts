import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  // Create worksheet data with headers
  const wsData = [
    columns.map((col) => col.header),
    ...data.map((row) => columns.map((col) => row[col.key] ?? '')),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map((col) => ({ wch: col.width || 15 }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate buffer and save
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${filename}.xlsx`);
}

// Patient columns configuration
export const patientColumns: ExportColumn[] = [
  { header: 'Name', key: 'name', width: 25 },
  { header: 'Email', key: 'email', width: 30 },
  { header: 'Phone', key: 'phone', width: 15 },
  { header: 'Address', key: 'address', width: 35 },
  { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
  { header: 'Registered Date', key: 'registeredDate', width: 15 },
];

// Bill columns configuration
export const billColumns: ExportColumn[] = [
  { header: 'Bill Number', key: 'billNumber', width: 18 },
  { header: 'Patient Name', key: 'patientName', width: 25 },
  { header: 'Patient Email', key: 'patientEmail', width: 30 },
  { header: 'Patient Phone', key: 'patientPhone', width: 15 },
  { header: 'Items', key: 'items', width: 40 },
  { header: 'Subtotal', key: 'subtotal', width: 12 },
  { header: 'Tax', key: 'tax', width: 10 },
  { header: 'Discount', key: 'discount', width: 10 },
  { header: 'Total Amount', key: 'totalAmount', width: 12 },
  { header: 'Paid Amount', key: 'paidAmount', width: 12 },
  { header: 'Balance', key: 'balance', width: 12 },
  { header: 'Status', key: 'status', width: 10 },
  { header: 'Due Date', key: 'dueDate', width: 12 },
  { header: 'Created Date', key: 'createdAt', width: 12 },
];
