'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Patient } from '@/types';

// Searchable Patient Dropdown Component with Pagination
function PatientSearchDropdown({
  selectedPatient,
  onSelect,
}: {
  selectedPatient: Patient | null;
  onSelect: (patient: Patient | null) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch patients from API
  const fetchPatients = async (searchTerm: string, pageNum: number, append: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: pageNum.toString(),
        limit: '10',
      });
      const res = await fetch(`/api/patients?${params}`);
      const data = await res.json();

      if (append) {
        setPatients((prev) => [...prev, ...data.patients]);
      } else {
        setPatients(data.patients);
      }
      setHasMore(data.pagination.hasMore);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when search changes or dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients(debouncedSearch, 1, false);
    }
  }, [debouncedSearch, isOpen]);

  // Handle load more
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPatients(debouncedSearch, nextPage, true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-900 mb-1">
        Search Existing Patient
      </label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={selectedPatient ? selectedPatient.name : 'Type to search patients...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          />
          {(selectedPatient || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelect(null);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-teal-600 font-medium border-b"
              onClick={() => {
                onSelect(null);
                setSearchQuery('');
                setIsOpen(false);
              }}
            >
              + New Patient (enter details below)
            </div>
            {loading && patients.length === 0 ? (
              <div className="px-4 py-2 text-gray-500">Loading...</div>
            ) : patients.length > 0 ? (
              <>
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      selectedPatient?._id === patient._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      onSelect(patient);
                      setSearchQuery('');
                      setIsOpen(false);
                    }}
                  >
                    <div className="font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">{patient.phone} • {patient.email}</div>
                  </div>
                ))}
                {hasMore && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadMore();
                    }}
                    disabled={loading}
                    className="w-full px-4 py-2 text-center text-blue-600 hover:bg-blue-50 border-t font-medium"
                  >
                    {loading ? 'Loading...' : `Load More (${patients.length} of ${total})`}
                  </button>
                )}
              </>
            ) : (
              <div className="px-4 py-2 text-gray-500">No patients found</div>
            )}
          </div>
        )}
      </div>
      {selectedPatient && !searchQuery && (
        <p className="mt-1 text-sm text-teal-600">
          Selected: {selectedPatient.name}
        </p>
      )}
    </div>
  );
}

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PatientData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
}

export default function BillForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });
  const [formData, setFormData] = useState({
    items: [{ description: '', quantity: 0, unitPrice: 0 }] as BillItem[],
    tax: 0,
    discount: 0,
    notes: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handlePatientSelect = (patient: Patient | null) => {
    setSelectedPatient(patient);

    if (patient) {
      // Populate form with selected patient data
      setPatientData({
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      });
    } else {
      // Clear form if "New Patient" is selected
      setPatientData({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
      });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + formData.tax - formData.discount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let patientId = selectedPatient?._id;

      // If no existing patient selected, create a new one
      if (!selectedPatient) {
        const patientRes = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: patientData.name,
            email: patientData.email,
            phone: patientData.phone,
            address: patientData.address,
            dateOfBirth: patientData.dateOfBirth,
          }),
        });

        if (!patientRes.ok) {
          alert('Failed to create patient');
          setLoading(false);
          return;
        }

        const patient = await patientRes.json();
        patientId = patient._id;
      }

      // Create the bill
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, patient: patientId }),
      });

      if (res.ok) {
        const bill = await res.json();
        router.push(`/bills/${bill._id}`);
      } else {
        alert('Failed to create bill');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Patient Information</h2>

        {/* Patient Search/Select Dropdown */}
        <div className="mb-4">
          <PatientSearchDropdown
            selectedPatient={selectedPatient}
            onSelect={handlePatientSelect}
          />
        </div>

        {/* Patient Details Form */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <Input
            label="Full Name"
            placeholder="Enter patient's name"
            value={patientData.name}
            onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter patient's email"
              value={patientData.email}
              onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              placeholder="Enter patient's phone number"
              value={patientData.phone}
              onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
              required
            />
          </div>
          <Input
            label="Address"
            placeholder="Enter patient's address"
            value={patientData.address}
            onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            value={patientData.dateOfBirth}
            onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
            required
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Bill Items</h2>
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  label={index === 0 ? 'Description' : undefined}
                  placeholder="Enter service or item description"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  required
                />
              </div>
              <div className="w-24">
                <Input
                  label={index === 0 ? 'Qty' : undefined}
                  type="number"
                  min="1"
                  value={item.quantity || ''}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="w-32">
                <Input
                  label={index === 0 ? 'Unit Price' : undefined}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice || ''}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="w-32">
                <Input
                  label={index === 0 ? 'Amount' : undefined}
                  value={item.quantity && item.unitPrice ? (item.quantity * item.unitPrice).toFixed(2) : ''}
                  disabled
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
                className="mb-0.5"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Additional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Tax Amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.tax || ''}
            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Discount"
            type="number"
            min="0"
            step="0.01"
            value={formData.discount || ''}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            rows={3}
            placeholder="Enter additional notes (optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </Card>

      <Card>
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Subtotal:</span>
              <span className="font-medium text-gray-900">Rs. {calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Tax:</span>
              <span className="font-medium text-gray-900">Rs. {formData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-900">Discount:</span>
              <span className="font-medium text-red-600">-Rs. {formData.discount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-lg text-gray-900">Rs. {calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Bill'}
        </Button>
      </div>
    </form>
  );
}
