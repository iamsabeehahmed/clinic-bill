import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const payment = await request.json();

    const bill = await Bill.findById(id);

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Add payment
    bill.payments.push({
      amount: payment.amount,
      method: payment.method,
      date: new Date(),
      reference: payment.reference,
    });

    // Update paid amount
    bill.paidAmount = bill.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

    // Update status
    if (bill.paidAmount >= bill.totalAmount) {
      bill.status = 'paid';
    } else if (bill.paidAmount > 0) {
      bill.status = 'partial';
    }

    await bill.save();
    const updatedBill = await Bill.findById(id).populate('patient');

    return NextResponse.json(updatedBill);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
