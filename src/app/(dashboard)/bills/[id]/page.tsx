'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, DollarSign, Receipt as ReceiptIcon, FileText, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Receipt from '@/components/billing/Receipt';
import ThermalReceipt from '@/components/billing/ThermalReceipt';
import PaymentModal from '@/components/billing/PaymentModal';
import BillEditModal from '@/components/billing/BillEditModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ExportDropdown } from '@/components/ui/DropdownMenu';
import { exportToExcel, billColumns } from '@/lib/export/excel';
import { exportToCSV } from '@/lib/export/csv';
import { exportToPDF, billPDFColumns } from '@/lib/export/pdf';
import { Bill } from '@/types';

export default function BillDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptType, setReceiptType] = useState<'standard' | 'thermal'>('thermal');
  const receiptRef = useRef<HTMLDivElement>(null);
  const thermalRef = useRef<HTMLDivElement>(null);

  // Edit and Delete state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handlePrintStandard = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: bill ? `Receipt-${bill.billNumber}` : 'Receipt',
  });

  const handlePrintThermal = useReactToPrint({
    contentRef: thermalRef,
    documentTitle: bill ? `Thermal-${bill.billNumber}` : 'Receipt',
  });

  useEffect(() => {
    fetchBill();
    // Store this bill ID as the last viewed bill for "Print Last Receipt" feature
    if (params.id) {
      localStorage.setItem('lastViewedBillId', params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (searchParams.get('print') === 'true' && bill) {
      setTimeout(() => handlePrintStandard(), 500);
    }
    if (searchParams.get('payment') === 'true' && bill) {
      setShowPaymentModal(true);
    }
  }, [searchParams, bill]);

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/bills/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBill(data);
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedBill: Bill) => {
    setBill(updatedBill);
  };

  const handleEditSave = (updatedBill: Bill) => {
    setBill(updatedBill);
  };

  const handleDelete = async () => {
    if (!bill) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/bills/${bill._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/bills');
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    if (!bill) return;

    setExportLoading(true);
    try {
      const res = await fetch('/api/bills/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [bill._id], format }),
      });

      if (res.ok) {
        const { data } = await res.json();
        const filename = `bill_${bill.billNumber}_${new Date().toISOString().split('T')[0]}`;

        if (format === 'xlsx') {
          exportToExcel(data, billColumns, filename);
        } else if (format === 'csv') {
          exportToCSV(data, billColumns, filename);
        } else if (format === 'pdf') {
          await exportToPDF({
            title: `Bill ${bill.billNumber}`,
            subtitle: `Generated on ${new Date().toLocaleDateString()}`,
            columns: billPDFColumns,
            data,
            filename,
          });
        }
      }
    } catch (error) {
      console.error('Error exporting bill:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      paid: 'success',
      partial: 'warning',
      pending: 'danger',
      cancelled: 'info',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Bill not found</p>
        <Link href="/bills">
          <Button variant="secondary">Back to Bills</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bills">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{bill.billNumber}</h1>
              {getStatusBadge(bill.status)}
            </div>
            <p className="text-gray-500 mt-1">Bill Details & Receipt</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            onExport={handleExport}
            disabled={exportLoading}
            label="Export"
          />
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
            <Button variant="secondary" onClick={() => setShowPaymentModal(true)}>
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Receipt Type Selector */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Receipt Type:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setReceiptType('thermal')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              receiptType === 'thermal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ReceiptIcon className="w-4 h-4 inline mr-2" />
            Thermal (80mm)
          </button>
          <button
            onClick={() => setReceiptType('standard')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              receiptType === 'standard'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Standard (A4)
          </button>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => receiptType === 'thermal' ? handlePrintThermal() : handlePrintStandard()}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print {receiptType === 'thermal' ? 'Thermal' : 'Standard'} Receipt
          </Button>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Receipt Preview</h2>
          <p className="text-sm text-gray-500">
            {receiptType === 'thermal'
              ? 'Optimized for 80mm thermal printers (POS systems)'
              : 'Standard A4/Letter format for laser/inkjet printers'
            }
          </p>
        </div>
        <div className={`p-6 ${receiptType === 'thermal' ? 'flex justify-center bg-gray-100' : ''}`}>
          {receiptType === 'standard' ? (
            <Receipt ref={receiptRef} bill={bill} />
          ) : (
            <div className="shadow-xl">
              <ThermalReceipt ref={thermalRef} bill={bill} />
            </div>
          )}
        </div>
      </div>

      {/* Hidden thermal receipt for printing */}
      <div className="hidden">
        <ThermalReceipt ref={thermalRef} bill={bill} />
      </div>

      {/* Payment Modal */}
      {bill && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bill={bill}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Edit Bill Modal */}
      <BillEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        bill={bill}
        onSave={handleEditSave}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Bill"
        message={`Are you sure you want to delete bill "${bill.billNumber}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
}
