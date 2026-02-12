import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (patientId) {
      query.patient = patientId;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      }
      if (endDate) {
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
      }
    }

    const bills = await Bill.find(query)
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Calculate amounts
    const subtotal = body.items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
      sum + (item.quantity * item.unitPrice), 0);
    const tax = body.tax || 0;
    const discount = body.discount || 0;
    const totalAmount = subtotal + tax - discount;

    // Build bill data — always mark as paid (cash) on creation
    const { status: _s, paidAmount: _p, payments: _pay, ...safeBody } = body;
    const billData = {
      ...safeBody,
      items: body.items.map((item: { quantity: number; unitPrice: number }) => ({
        ...item,
        amount: item.quantity * item.unitPrice,
      })),
      subtotal,
      totalAmount,
      status: 'paid',
      paidAmount: totalAmount,
      payments: [{
        amount: totalAmount,
        method: 'cash',
        date: new Date(),
      }],
    };

    const bill = await Bill.create(billData);
    const populatedBill = await Bill.findById(bill._id).populate('patient', 'name email phone');

    return NextResponse.json(populatedBill, { status: 201 });
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
