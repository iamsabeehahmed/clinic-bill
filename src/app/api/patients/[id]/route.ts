import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';
import Bill from '@/models/Bill';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const patient = await Patient.findByIdAndUpdate(id, body, { new: true });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const deleteBills = searchParams.get('deleteBills') === 'true';

    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check for associated bills
    const billsCount = await Bill.countDocuments({ patient: id });

    if (billsCount > 0 && deleteBills) {
      // Delete all associated bills
      await Bill.deleteMany({ patient: id });
    }

    await Patient.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Patient deleted successfully',
      billsDeleted: deleteBills ? billsCount : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
