'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { Bill, Patient } from '@/types';

interface ThermalReceiptProps {
  bill: Bill;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

// Thermal receipt designed for 80mm thermal printers (standard POS receipt width)
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    paid: '#16a34a',
    partial: '#ca8a04',
    pending: '#dc2626',
    cancelled: '#6b7280',
  };
  return colors[status] || '#dc2626';
};

const ThermalReceipt = forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ bill, clinicName = 'ClinicBill Pro', clinicAddress = '123 Medical Center Drive', clinicPhone = '(555) 123-4567' }, ref) => {
    const patient = bill.patient as Patient;

    return (
      <div
        ref={ref}
        style={{
          width: '80mm',
          maxWidth: '80mm',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          lineHeight: '1.4',
          backgroundColor: '#ffffff',
          padding: '16px',
          color: '#000000',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#000000', margin: 0 }}>{clinicName}</p>
          <p style={{ color: '#333333', margin: '4px 0' }}>{clinicAddress}</p>
          <p style={{ color: '#333333', margin: 0 }}>Tel: {clinicPhone}</p>
        </div>

        {/* Receipt Type */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#000000', margin: 0 }}>
            {bill.status === 'paid' ? '*** PAYMENT RECEIPT ***' : '*** INVOICE ***'}
          </p>
        </div>

        {/* Bill Info */}
        <div style={{ borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
            <span>Bill #:</span>
            <span style={{ fontWeight: 'bold' }}>{bill.billNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
            <span>Date:</span>
            <span>{format(new Date(bill.createdAt), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
            <span>Due:</span>
            <span>{format(new Date(bill.dueDate), 'dd/MM/yyyy')}</span>
          </div>
        </div>

        {/* Patient Info */}
        <div style={{ borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
          <p style={{ fontWeight: 'bold', color: '#000000', margin: 0 }}>Patient:</p>
          <p style={{ color: '#000000', margin: '4px 0' }}>{patient.name}</p>
          <p style={{ color: '#333333', margin: 0 }}>{patient.phone}</p>
        </div>

        {/* Items */}
        <div style={{ borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', color: '#000000' }}>
            <span style={{ flex: 1 }}>Item</span>
            <span style={{ width: '48px', textAlign: 'center' }}>Qty</span>
            <span style={{ width: '64px', textAlign: 'right' }}>Amount</span>
          </div>
          <div style={{ borderTop: '1px solid #cccccc', paddingTop: '8px' }}>
            {bill.items.map((item, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>{item.description}</span>
                  <span style={{ width: '48px', textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ width: '64px', textAlign: 'right' }}>Rs.{item.amount.toFixed(2)}</span>
                </div>
                <div style={{ color: '#444444', fontSize: '10px', paddingLeft: '8px' }}>
                  @ Rs.{item.unitPrice.toFixed(2)} each
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{ borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
            <span>Subtotal:</span>
            <span>Rs.{bill.subtotal.toFixed(2)}</span>
          </div>
          {bill.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
              <span>Tax:</span>
              <span>Rs.{bill.tax.toFixed(2)}</span>
            </div>
          )}
          {bill.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000000' }}>
              <span>Discount:</span>
              <span>-Rs.{bill.discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #cccccc', color: '#000000' }}>
            <span>TOTAL:</span>
            <span>Rs.{bill.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div style={{ borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#000000' }}>Paid:</span>
            <span style={{ color: '#16a34a' }}>Rs.{bill.paidAmount.toFixed(2)}</span>
          </div>
          {bill.totalAmount - bill.paidAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span style={{ color: '#000000' }}>Balance Due:</span>
              <span style={{ color: '#dc2626' }}>Rs.{(bill.totalAmount - bill.paidAmount).toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ color: '#000000' }}>Status:</span>
            <span style={{
              fontWeight: 'bold',
              color: getStatusColor(bill.status)
            }}>
              {bill.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Payment History (if any) */}
        {bill.payments.length > 0 && (
          <div style={{ borderBottom: '1px dashed #666666', paddingBottom: '12px', marginBottom: '12px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#000000' }}>Payment History:</p>
            {bill.payments.map((payment, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#000000' }}>
                <span>{format(new Date(payment.date), 'dd/MM/yy')}</span>
                <span style={{ textTransform: 'capitalize' }}>{payment.method}</span>
                <span>Rs.{payment.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#333333', marginTop: '16px' }}>
          <p style={{ margin: 0 }}>Thank you for your visit!</p>
          <p style={{ margin: '4px 0' }}>Questions? Call {clinicPhone}</p>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #666666' }}>
            <p style={{ fontWeight: 'bold', color: '#000000', margin: 0 }}>*** END OF RECEIPT ***</p>
            <p style={{ fontSize: '10px', marginTop: '4px', color: '#333333' }}>{format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
          </div>
        </div>

        {/* Barcode placeholder - can be replaced with actual barcode */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#000000' }}>||| {bill.billNumber} |||</p>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';

export default ThermalReceipt;
