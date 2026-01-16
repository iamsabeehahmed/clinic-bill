export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  createdAt: string;
}

export interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'insurance';
  date: string;
  reference?: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  patient: Patient | string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'cancelled';
  payments: Payment[];
  notes?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}
