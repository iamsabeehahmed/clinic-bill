import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { ids, format, dateRange, status } = body;

    // Build query
    const query: Record<string, unknown> = {};

    if (ids && ids.length > 0) {
      query._id = { $in: ids };
    }

    if (status) {
      query.status = status;
    }

    if (dateRange?.start || dateRange?.end) {
      query.createdAt = {};
      if (dateRange.start) {
        (query.createdAt as Record<string, Date>).$gte = new Date(dateRange.start);
      }
      if (dateRange.end) {
        (query.createdAt as Record<string, Date>).$lte = new Date(dateRange.end);
      }
    }

    const bills = await Bill.find(query).populate('patient').sort({ createdAt: -1 });

    if (bills.length === 0) {
      return NextResponse.json({ error: 'No bills found to export' }, { status: 404 });
    }

    // Format data for export
    const exportData = bills.map((bill) => {
      const patient = bill.patient as { name?: string; email?: string; phone?: string } | null;
      return {
        id: bill._id.toString(),
        billNumber: bill.billNumber,
        patientName: patient?.name || 'N/A',
        patientEmail: patient?.email || 'N/A',
        patientPhone: patient?.phone || 'N/A',
        items: bill.items.map((item: { description: string; quantity: number }) => `${item.description} (${item.quantity}x)`).join('; '),
        subtotal: bill.subtotal,
        tax: bill.tax,
        discount: bill.discount,
        totalAmount: bill.totalAmount,
        paidAmount: bill.paidAmount,
        balance: bill.totalAmount - bill.paidAmount,
        status: bill.status,
        dueDate: bill.dueDate?.toISOString().split('T')[0] || '',
        createdAt: bill.createdAt?.toISOString().split('T')[0] || '',
      };
    });

    return NextResponse.json({
      data: exportData,
      format,
      count: exportData.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export bills' }, { status: 500 });
  }
}
