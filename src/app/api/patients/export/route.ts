import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Patient from '@/models/Patient';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { ids, format } = body;

    // Build query
    const query = ids && ids.length > 0 ? { _id: { $in: ids } } : {};
    const patients = await Patient.find(query).sort({ createdAt: -1 });

    if (patients.length === 0) {
      return NextResponse.json({ error: 'No patients found to export' }, { status: 404 });
    }

    // Format data for export
    const exportData = patients.map((patient) => ({
      id: patient._id.toString(),
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      dateOfBirth: patient.dateOfBirth?.toISOString().split('T')[0] || '',
      registeredDate: patient.createdAt?.toISOString().split('T')[0] || '',
    }));

    return NextResponse.json({
      data: exportData,
      format,
      count: exportData.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export patients' }, { status: 500 });
  }
}
