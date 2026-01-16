'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ExportDropdown } from '@/components/ui/DropdownMenu';
import PatientEditModal from '@/components/patients/PatientEditModal';
import { useSelection } from '@/lib/hooks/useSelection';
import { exportToExcel, patientColumns } from '@/lib/export/excel';
import { exportToCSV } from '@/lib/export/csv';
import { exportToPDF, patientPDFColumns } from '@/lib/export/pdf';
import { Patient } from '@/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
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
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Delete state
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Export loading
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients?limit=100');
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '', address: '', dateOfBirth: '' });
        fetchPatients();
      }
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const handleEditSave = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === updatedPatient._id ? updatedPatient : p))
    );
  };

  const handleDeletePatient = async () => {
    if (!deletingPatient) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/patients/${deletingPatient._id}?deleteBills=true`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p._id !== deletingPatient._id));
        setDeletingPatient(null);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/patients/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, deleteBills: true }),
      });

      if (res.ok) {
        setPatients((prev) => prev.filter((p) => !selectedIds.includes(p._id)));
        selectNone();
        setShowBulkDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting patients:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    setExportLoading(true);
    try {
      const idsToExport = selectedCount > 0 ? selectedIds : undefined;
      const res = await fetch('/api/patients/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToExport, format }),
      });

      if (res.ok) {
        const { data } = await res.json();
        const filename = `patients_${new Date().toISOString().split('T')[0]}`;

        if (format === 'xlsx') {
          exportToExcel(data, patientColumns, filename);
        } else if (format === 'csv') {
          exportToCSV(data, patientColumns, filename);
        } else if (format === 'pdf') {
          await exportToPDF({
            title: 'Patient List',
            subtitle: selectedCount > 0 ? `${selectedCount} selected patients` : 'All patients',
            columns: patientPDFColumns,
            data,
            filename,
          });
        }
      }
    } catch (error) {
      console.error('Error exporting patients:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const allPatientIds = patients.map((p) => p._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">Manage patient records</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown
            onExport={handleExport}
            disabled={exportLoading}
            label={selectedCount > 0 ? `Export (${selectedCount})` : 'Export All'}
          />
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Selection Toolbar */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            {selectedCount} patient{selectedCount > 1 ? 's' : ''} selected
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

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={isAllSelected(allPatientIds)}
                    indeterminate={isIndeterminate(allPatientIds)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll(allPatientIds);
                      } else {
                        selectNone();
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No patients found. Add your first patient to get started.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className={`hover:bg-gray-50 ${
                      isSelected(patient._id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={isSelected(patient._id)}
                        onChange={() => toggleSelection(patient._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phone}</div>
                      <div className="text-sm text-gray-500">{patient.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {patient.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(patient.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPatient(patient)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingPatient(patient)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Patient"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Address"
            placeholder="123 Main St, City, State"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <PatientEditModal
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        patient={editingPatient}
        onSave={handleEditSave}
      />

      {/* Delete Single Patient Confirm */}
      <ConfirmDialog
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete "${deletingPatient?.name}"? This will also delete all associated bills. This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        loading={deleteLoading}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Patients"
        message={`Are you sure you want to delete ${selectedCount} patient${selectedCount > 1 ? 's' : ''}? This will also delete all associated bills. This action cannot be undone.`}
        variant="danger"
        confirmText={`Delete ${selectedCount} Patient${selectedCount > 1 ? 's' : ''}`}
        loading={deleteLoading}
      />
    </div>
  );
}
