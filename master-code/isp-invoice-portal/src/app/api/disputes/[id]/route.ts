import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Dispute from '@/models/Dispute';

// GET a single dispute by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }
    return NextResponse.json(dispute);
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json({ error: 'Failed to fetch dispute' }, { status: 500 });
  }
}

// UPDATE a dispute by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const { id } = await params;
    const dispute = await Dispute.findByIdAndUpdate(id, data, { new: true });
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }
    return NextResponse.json(dispute);
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}

// DELETE a dispute by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const dispute = await Dispute.findByIdAndDelete(id);
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Dispute deleted successfully' });
  } catch (error) {
    console.error('Error deleting dispute:', error);
    return NextResponse.json({ error: 'Failed to delete dispute' }, { status: 500 });
  }
}
