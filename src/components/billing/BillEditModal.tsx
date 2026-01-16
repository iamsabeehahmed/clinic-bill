'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Bill } from '@/types';

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface BillEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onSave: (updatedBill: Bill) => void;
}

export default function BillEditModal({
  isOpen,
  onClose,
  bill,
  onSave,
}: BillEditModalProps) {
  const [formData, setFormData] = useState({
    items: [] as BillItem[],
    tax: 0,
    discount: 0,
    notes: '',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bill) {
      setFormData({
        items: bill.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
        tax: bill.tax || 0,
        discount: bill.discount || 0,
        notes: bill.notes || '',
        dueDate: bill.dueDate
          ? new Date(bill.dueDate).toISOString().split('T')[0]
          : '',
      });
      setError('');
    }
  }, [bill]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }],
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

    // Auto-calculate amount
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

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
    if (!bill) return;

    setLoading(true);
    setError('');

    try {
      // Prepare items with amount calculated
      const items = formData.items.map((item) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      }));

      const subtotal = calculateSubtotal();
      const totalAmount = calculateTotal();

      const res = await fetch(`/api/bills/${bill._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal,
          tax: formData.tax,
          discount: formData.discount,
          totalAmount,
          notes: formData.notes,
          dueDate: formData.dueDate,
        }),
      });

      if (res.ok) {
        const updatedBill = await res.json();
        onSave(updatedBill);
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update bill');
      }
    } catch (err) {
      setError('An error occurred while updating the bill');
    } finally {
      setLoading(false);
    }
  };

  if (!bill) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Bill" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Bill Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Bill Items</h3>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label={index === 0 ? 'Description' : undefined}
                    placeholder="Service or item"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="w-20">
                  <Input
                    label={index === 0 ? 'Qty' : undefined}
                    type="number"
                    min="1"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="w-28">
                  <Input
                    label={index === 0 ? 'Price' : undefined}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>
                <div className="w-28">
                  <Input
                    label={index === 0 ? 'Amount' : undefined}
                    value={(item.quantity * item.unitPrice).toFixed(2)}
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
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Tax"
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

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Notes</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            rows={2}
            placeholder="Additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-end">
            <div className="w-48 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">Rs. {calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium text-gray-900">Rs. {formData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">-Rs. {formData.discount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-1 flex justify-between">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-gray-900">Rs. {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
