import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';

export async function POST() {
  try {
    await dbConnect();

    // Create admin user
    const adminUser = {
      name: 'Admin User',
      email: 'admin@clinic.com',
      password: 'admin123',
      role: 'admin',
      phone: '(555) 100-0001',
    };

    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser);
    }

    // Create some demo patients
    const demoPatients = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '(555) 200-0001',
        address: '456 Oak Avenue, City, State 12345',
        dateOfBirth: new Date('1985-03-20'),
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '(555) 200-0002',
        address: '789 Pine Road, City, State 12345',
        dateOfBirth: new Date('1978-11-08'),
      },
      {
        name: 'Carol Williams',
        email: 'carol@example.com',
        phone: '(555) 200-0003',
        address: '321 Elm Street, City, State 12345',
        dateOfBirth: new Date('1992-07-25'),
      },
    ];

    for (const patientData of demoPatients) {
      const existingPatient = await Patient.findOne({ email: patientData.email });
      if (!existingPatient) {
        await Patient.create(patientData);
      }
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      users: 1,
      patients: demoPatients.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to seed database', details: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed the database',
    endpoint: '/api/seed',
  });
}
