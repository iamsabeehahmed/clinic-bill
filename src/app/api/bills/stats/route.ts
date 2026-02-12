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
      todayRevenueResult,
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
      // Today's collection
      Bill.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
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
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const totalPaidAmount = totalPaidAmountResult[0]?.total || 0;

    // Calculate percentage changes
    let revenueChange = 0;
    if (lastMonthRevenue > 0) {
      revenueChange = Number.parseFloat(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1));
    } else if (monthlyRevenue > 0) {
      revenueChange = 100;
    }

    let billsChange = 0;
    if (lastMonthBills > 0) {
      billsChange = Number.parseFloat(((monthlyBills - lastMonthBills) / lastMonthBills * 100).toFixed(1));
    } else if (monthlyBills > 0) {
      billsChange = 100;
    }

    return NextResponse.json({
      totalBills,
      pendingBills,
      paidBills,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      todayBills,
      todayRevenue,
      totalPaidAmount,
      totalPatients,
      monthlyBills,
      lastMonthBills,
      revenueChange,
      billsChange,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
