'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { Bill, Patient } from '@/types';

interface ReceiptProps {
  bill: Bill;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ bill }, ref) => {
  const patient = bill.patient as Patient;

  return (
    <div
      ref={ref}
      className="bg-white p-8 max-w-2xl mx-auto"
      style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', margin: 0 }}>CLINIC BILLING</h1>
        <p style={{ fontSize: '14px', color: '#333333', marginTop: '4px' }}>Healthcare Services</p>
        <p style={{ fontSize: '12px', color: '#444444', marginTop: '4px' }}>123 Medical Center Drive, City, State 12345</p>
        <p style={{ fontSize: '12px', color: '#444444' }}>Phone: (555) 123-4567 | Email: billing@clinic.com</p>
      </div>

      {/* Receipt Title */}
      <div className="text-center mb-6">
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: '#f3f4f6',
          padding: '8px',
          color: '#000000'
        }}>
          {bill.status === 'paid' ? 'PAYMENT RECEIPT' : 'INVOICE'}
        </h2>
      </div>

      {/* Bill Info */}
      <div className="flex justify-between mb-6">
        <div>
          <p style={{ fontSize: '14px', color: '#000000' }}><strong>Bill No:</strong> {bill.billNumber}</p>
          <p style={{ fontSize: '14px', color: '#000000' }}><strong>Date:</strong> {format(new Date(bill.createdAt), 'MMM dd, yyyy')}</p>
          <p style={{ fontSize: '14px', color: '#000000' }}><strong>Due Date:</strong> {format(new Date(bill.dueDate), 'MMM dd, yyyy')}</p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#000000' }}>Status:</p>
          <p style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: bill.status === 'paid' ? '#16a34a' : bill.status === 'partial' ? '#ca8a04' : '#dc2626'
          }}>
            {bill.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Patient Info */}
      <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
        <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Bill To:</h3>
        <p style={{ fontSize: '14px', color: '#000000', fontWeight: '600' }}>{patient.name}</p>
        <p style={{ fontSize: '14px', color: '#333333' }}>{patient.address}</p>
        <p style={{ fontSize: '14px', color: '#333333' }}>Phone: {patient.phone}</p>
        <p style={{ fontSize: '14px', color: '#333333' }}>Email: {patient.email}</p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6" style={{ fontSize: '14px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>#</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Description</th>
            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px 12px', color: '#000000' }}>{index + 1}</td>
              <td style={{ padding: '8px 12px', color: '#000000' }}>{item.description}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', color: '#000000' }}>{item.quantity}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: '#000000' }}>Rs. {item.unitPrice.toFixed(2)}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: '#000000' }}>Rs. {item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div style={{ width: '240px' }}>
          <div className="flex justify-between" style={{ padding: '4px 0', fontSize: '14px' }}>
            <span style={{ color: '#000000' }}>Subtotal:</span>
            <span style={{ color: '#000000' }}>Rs. {bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ padding: '4px 0', fontSize: '14px' }}>
            <span style={{ color: '#000000' }}>Tax:</span>
            <span style={{ color: '#000000' }}>Rs. {bill.tax.toFixed(2)}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between" style={{ padding: '4px 0', fontSize: '14px', color: '#dc2626' }}>
              <span>Discount:</span>
              <span>-Rs. {bill.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between" style={{
            padding: '8px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            borderTop: '2px solid #1f2937',
            marginTop: '8px',
            color: '#000000'
          }}>
            <span>Total:</span>
            <span>Rs. {bill.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ padding: '4px 0', fontSize: '14px', color: '#16a34a' }}>
            <span>Paid:</span>
            <span>Rs. {bill.paidAmount.toFixed(2)}</span>
          </div>
          {bill.totalAmount - bill.paidAmount > 0 && (
            <div className="flex justify-between" style={{ padding: '4px 0', fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
              <span>Balance Due:</span>
              <span>Rs. {(bill.totalAmount - bill.paidAmount).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      {bill.payments.length > 0 && (
        <div className="mb-6">
          <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Payment History:</h3>
          <table className="w-full" style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '4px 8px', textAlign: 'left', color: '#000000' }}>Date</th>
                <th style={{ padding: '4px 8px', textAlign: 'left', color: '#000000' }}>Method</th>
                <th style={{ padding: '4px 8px', textAlign: 'left', color: '#000000' }}>Reference</th>
                <th style={{ padding: '4px 8px', textAlign: 'right', color: '#000000' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.payments.map((payment, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '4px 8px', color: '#000000' }}>{format(new Date(payment.date), 'MMM dd, yyyy')}</td>
                  <td style={{ padding: '4px 8px', color: '#000000', textTransform: 'capitalize' }}>{payment.method}</td>
                  <td style={{ padding: '4px 8px', color: '#000000' }}>{payment.reference || '-'}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'right', color: '#000000' }}>Rs. {payment.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {bill.notes && (
        <div className="mb-6">
          <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Notes:</h3>
          <p style={{ fontSize: '14px', color: '#333333' }}>{bill.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '2px solid #1f2937', paddingTop: '16px', textAlign: 'center', fontSize: '12px', color: '#444444' }}>
        <p>Thank you for choosing Clinic Billing!</p>
        <p style={{ marginTop: '4px' }}>For questions about this bill, please contact our billing department.</p>
        <p style={{ marginTop: '8px', fontWeight: '600' }}>This is a computer-generated receipt.</p>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';

export default Receipt;
