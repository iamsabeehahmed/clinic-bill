import mongoose, { Schema, Document } from 'mongoose';

export interface IBillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IPayment {
  amount: number;
  method: 'cash' | 'card' | 'upi' | 'insurance';
  date: Date;
  reference?: string;
}

export interface IBill extends Document {
  billNumber: string;
  patient: mongoose.Types.ObjectId;
  items: IBillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'cancelled';
  payments: IPayment[];
  notes?: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BillItemSchema = new Schema<IBillItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
});

const PaymentSchema = new Schema<IPayment>({
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['cash', 'card', 'upi', 'insurance'], required: true },
  date: { type: Date, default: Date.now },
  reference: { type: String },
});

const BillSchema = new Schema<IBill>({
  billNumber: { type: String, unique: true },
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  items: [BillItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'cancelled'], default: 'pending' },
  payments: [PaymentSchema],
  notes: { type: String },
  dueDate: { type: Date, required: true },
}, {
  timestamps: true,
});

// Auto-generate bill number before validation
BillSchema.pre('validate', async function() {
  if (this.isNew && !this.billNumber) {
    const count = await mongoose.models.Bill.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.billNumber = `BILL-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

export default mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
