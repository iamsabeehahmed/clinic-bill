import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';
import Bill from '@/models/Bill';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { ids, deleteBills = false } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No patient IDs provided' }, { status: 400 });
    }

    let billsDeleted = 0;

    if (deleteBills) {
      // Delete all bills associated with these patients
      const result = await Bill.deleteMany({ patient: { $in: ids } });
      billsDeleted = result.deletedCount;
    }

    // Delete patients
    const deleteResult = await Patient.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: 'Patients deleted successfully',
      patientsDeleted: deleteResult.deletedCount,
      billsDeleted,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patients' }, { status: 500 });
  }
}
