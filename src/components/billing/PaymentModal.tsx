'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Bill } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  onPaymentSuccess: (updatedBill: Bill) => void;
}

export default function PaymentModal({ isOpen, onClose, bill, onPaymentSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState({
    amount: bill.totalAmount - bill.paidAmount,
    method: 'cash' as 'cash' | 'card' | 'upi' | 'insurance',
    reference: '',
  });

  const balanceDue = bill.totalAmount - bill.paidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/bills/${bill._id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      if (res.ok) {
        const updatedBill = await res.json();
        onPaymentSuccess(updatedBill);
        onClose();
      } else {
        alert('Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">Rs. {bill.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Already Paid:</span>
            <span className="font-medium text-green-600">Rs. {bill.paidAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t mt-2 pt-2">
            <span>Balance Due:</span>
            <span className="text-red-600">Rs. {balanceDue.toFixed(2)}</span>
          </div>
        </div>

        <Input
          label="Payment Amount"
          type="number"
          min="0.01"
          max={balanceDue}
          step="0.01"
          value={payment.amount}
          onChange={(e) => setPayment({ ...payment, amount: parseFloat(e.target.value) || 0 })}
          required
        />

        <Select
          label="Payment Method"
          value={payment.method}
          onChange={(e) => setPayment({ ...payment, method: e.target.value as 'cash' | 'card' | 'upi' | 'insurance' })}
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'card', label: 'Credit/Debit Card' },
            { value: 'upi', label: 'UPI' },
            { value: 'insurance', label: 'Insurance' },
          ]}
        />

        <Input
          label="Reference Number (Optional)"
          placeholder="Transaction ID, Check number, etc."
          value={payment.reference}
          onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || payment.amount <= 0}>
            {loading ? 'Processing...' : `Record Rs. ${payment.amount.toFixed(2)} Payment`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
