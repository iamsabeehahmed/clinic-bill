'use client';

import { saveAs } from 'file-saver';

interface PDFColumn {
  header: string;
  key: string;
  width?: number;
}

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  columns: PDFColumn[];
  data: Record<string, unknown>[];
  filename: string;
}

// Simple PDF generation using jsPDF-like approach with canvas
export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const { title, subtitle, columns, data, filename } = options;

  // Dynamic import jspdf
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  }

  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Calculate column widths
  const availableWidth = pageWidth - (margin * 2);
  const defaultColWidth = availableWidth / columns.length;
  const colWidths = columns.map((col) => col.width || defaultColWidth);
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const scale = availableWidth / totalWidth;
  const scaledWidths = colWidths.map((w) => w * scale);

  // Table header
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(margin, yPosition, availableWidth, 8, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);

  let xPosition = margin + 2;
  columns.forEach((col, index) => {
    doc.text(col.header, xPosition, yPosition + 5.5);
    xPosition += scaledWidths[index];
  });

  yPosition += 10;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  data.forEach((row, rowIndex) => {
    // Check for page break
    if (yPosition > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }

    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition - 4, availableWidth, 8, 'F');
    }

    xPosition = margin + 2;
    doc.setFontSize(8);

    columns.forEach((col, colIndex) => {
      const value = row[col.key];
      const text = value !== null && value !== undefined ? String(value) : '';
      // Truncate text if too long
      const maxWidth = scaledWidths[colIndex] - 4;
      const truncated = doc.splitTextToSize(text, maxWidth)[0] || '';
      doc.text(truncated, xPosition, yPosition);
      xPosition += scaledWidths[colIndex];
    });

    yPosition += 8;
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const pdfBlob = doc.output('blob');
  saveAs(pdfBlob, `${filename}.pdf`);
}

// Patient PDF columns
export const patientPDFColumns: PDFColumn[] = [
  { header: 'Name', key: 'name', width: 35 },
  { header: 'Email', key: 'email', width: 45 },
  { header: 'Phone', key: 'phone', width: 25 },
  { header: 'Address', key: 'address', width: 50 },
  { header: 'DOB', key: 'dateOfBirth', width: 25 },
  { header: 'Registered', key: 'registeredDate', width: 25 },
];

// Bill PDF columns
export const billPDFColumns: PDFColumn[] = [
  { header: 'Bill #', key: 'billNumber', width: 25 },
  { header: 'Patient', key: 'patientName', width: 35 },
  { header: 'Total', key: 'totalAmount', width: 20 },
  { header: 'Paid', key: 'paidAmount', width: 20 },
  { header: 'Balance', key: 'balance', width: 20 },
  { header: 'Status', key: 'status', width: 18 },
  { header: 'Due Date', key: 'dueDate', width: 22 },
  { header: 'Created', key: 'createdAt', width: 22 },
];
