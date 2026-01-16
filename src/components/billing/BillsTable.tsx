'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Eye, Printer, DollarSign, Edit, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ExportDropdown } from '@/components/ui/DropdownMenu';
import BillEditModal from '@/components/billing/BillEditModal';
import { useSelection } from '@/lib/hooks/useSelection';
import { exportToExcel, billColumns } from '@/lib/export/excel';
import { exportToCSV } from '@/lib/export/csv';
import { exportToPDF, billPDFColumns } from '@/lib/export/pdf';
import { Bill, Patient } from '@/types';

interface BillsTableProps {
  initialBills?: Bill[];
}

export default function BillsTable({ initialBills }: BillsTableProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills || []);
  const [loading, setLoading] = useState(!initialBills);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
  });

  // Selection state
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    selectAll,
    selectNone,
    isAllSelected,
    isIndeterminate,
    selectedCount,
  } = useSelection();

  // Edit state
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Delete state
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Export loading
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (!initialBills) {
      fetchBills();
    }
  }, [initialBills]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/bills?${params.toString()}`);
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchBills();
  };

  const handleEditSave = (updatedBill: Bill) => {
    setBills((prev) =>
      prev.map((b) => (b._id === updatedBill._id ? updatedBill : b))
    );
  };

  const handleDeleteBill = async () => {
    if (!deletingBill) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/bills/${deletingBill._id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBills((prev) => prev.filter((b) => b._id !== deletingBill._id));
        setDeletingBill(null);
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/bills/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setBills((prev) => prev.filter((b) => !selectedIds.includes(b._id)));
        selectNone();
        setShowBulkDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting bills:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    setExportLoading(true);
    try {
      const idsToExport = selectedCount > 0 ? selectedIds : undefined;
      const res = await fetch('/api/bills/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: idsToExport,
          format,
          dateRange: filters.startDate || filters.endDate
            ? { start: filters.startDate, end: filters.endDate }
            : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
        }),
      });

      if (res.ok) {
        const { data } = await res.json();
        const filename = `bills_${new Date().toISOString().split('T')[0]}`;

        if (format === 'xlsx') {
          exportToExcel(data, billColumns, filename);
        } else if (format === 'csv') {
          exportToCSV(data, billColumns, filename);
        } else if (format === 'pdf') {
          await exportToPDF({
            title: 'Bills Report',
            subtitle: selectedCount > 0 ? `${selectedCount} selected bills` : 'All bills',
            columns: billPDFColumns,
            data,
            filename,
          });
        }
      }
    } catch (error) {
      console.error('Error exporting bills:', error);
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

  const allBillIds = bills.map((b) => b._id);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-40">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'partial', label: 'Partial' },
                { value: 'paid', label: 'Paid' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
          <div className="w-40">
            <Input
              label="From Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="w-40">
            <Input
              label="To Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <Button onClick={handleFilterChange}>Apply Filters</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters({ status: 'all', startDate: '', endDate: '' });
              setTimeout(fetchBills, 0);
            }}
          >
            Clear
          </Button>
          <div className="ml-auto">
            <ExportDropdown
              onExport={handleExport}
              disabled={exportLoading}
              label={selectedCount > 0 ? `Export (${selectedCount})` : 'Export All'}
            />
          </div>
        </div>
      </Card>

      {/* Selection Toolbar */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            {selectedCount} bill{selectedCount > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={selectNone}>
              Clear Selection
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={isAllSelected(allBillIds)}
                    indeterminate={isIndeterminate(allBillIds)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll(allBillIds);
                      } else {
                        selectNone();
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No bills found
                  </td>
                </tr>
              ) : (
                bills.map((bill) => {
                  const patient = bill.patient as Patient;
                  return (
                    <tr
                      key={bill._id}
                      className={`hover:bg-gray-50 ${
                        isSelected(bill._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={isSelected(bill._id)}
                          onChange={() => toggleSelection(bill._id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bill.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient?.name}</div>
                        <div className="text-sm text-gray-500">{patient?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(bill.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rs. {bill.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        Rs. {bill.paidAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(bill.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-1">
                          <Link href={`/bills/${bill._id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/bills/${bill._id}?print=true`}>
                            <Button variant="ghost" size="sm" title="Print">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit"
                            onClick={() => setEditingBill(bill)}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            onClick={() => setDeletingBill(bill)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          {bill.status !== 'paid' && bill.status !== 'cancelled' && (
                            <Link href={`/bills/${bill._id}?payment=true`}>
                              <Button variant="ghost" size="sm" title="Record Payment">
                                <DollarSign className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Bill Modal */}
      <BillEditModal
        isOpen={!!editingBill}
        onClose={() => setEditingBill(null)}
        bill={editingBill}
        onSave={handleEditSave}
      />

      {/* Delete Single Bill Confirm */}
      <ConfirmDialog
        isOpen={!!deletingBill}
        onClose={() => setDeletingBill(null)}
        onConfirm={handleDeleteBill}
        title="Delete Bill"
        message={`Are you sure you want to delete bill "${deletingBill?.billNumber}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        loading={deleteLoading}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Bills"
        message={`Are you sure you want to delete ${selectedCount} bill${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
        variant="danger"
        confirmText={`Delete ${selectedCount} Bill${selectedCount > 1 ? 's' : ''}`}
        loading={deleteLoading}
      />
    </div>
  );
}
