import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No bill IDs provided' }, { status: 400 });
    }

    const deleteResult = await Bill.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: 'Bills deleted successfully',
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete bills' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { ids, updates } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No bill IDs provided' }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const updateResult = await Bill.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );

    return NextResponse.json({
      message: 'Bills updated successfully',
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bills' }, { status: 500 });
  }
}
