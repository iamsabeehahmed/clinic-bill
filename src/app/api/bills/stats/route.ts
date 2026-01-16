import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Patient from '@/models/Patient';

export async function GET() {
  try {
    await dbConnect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalBills,
      pendingBills,
      paidBills,
      totalRevenueResult,
      monthlyRevenueResult,
      lastMonthRevenueResult,
      todayBills,
      pendingAmountResult,
      totalPaidAmountResult,
      totalPatients,
      monthlyBills,
      lastMonthBills,
    ] = await Promise.all([
      Bill.countDocuments(),
      Bill.countDocuments({ status: { $in: ['pending', 'partial'] } }),
      Bill.countDocuments({ status: 'paid' }),
      // Total revenue (all paid amounts)
      Bill.aggregate([
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      // This month's revenue
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      // Last month's revenue
      Bill.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      Bill.countDocuments({ createdAt: { $gte: today } }),
      // Pending amount (total owed - paid)
      Bill.aggregate([
        { $match: { status: { $in: ['pending', 'partial'] } } },
        { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } }
      ]),
      // Total amount paid across all bills
      Bill.aggregate([
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      Patient.countDocuments(),
      // This month's bills count
      Bill.countDocuments({ createdAt: { $gte: startOfMonth } }),
      // Last month's bills count
      Bill.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;
    const pendingAmount = pendingAmountResult[0]?.total || 0;
    const totalPaidAmount = totalPaidAmountResult[0]?.total || 0;

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue > 0
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : monthlyRevenue > 0 ? '100' : '0';

    const billsChange = lastMonthBills > 0
      ? ((monthlyBills - lastMonthBills) / lastMonthBills * 100).toFixed(1)
      : monthlyBills > 0 ? '100' : '0';

    return NextResponse.json({
      totalBills,
      pendingBills,
      paidBills,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      todayBills,
      pendingAmount,
      totalPaidAmount,
      totalPatients,
      monthlyBills,
      lastMonthBills,
      revenueChange: parseFloat(revenueChange as string),
      billsChange: parseFloat(billsChange as string),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
