import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Dispute from '@/models/Dispute';

export async function GET() {
  try {
    await connectToDatabase();
    const disputes = await Dispute.find().sort({ createdAt: -1 });
    return NextResponse.json(disputes);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch disputes.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { username, mobile, category, description } = await req.json();
    if (!username || !mobile || !category || !description) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    const dispute = await Dispute.create({ username, mobile, category, description });
    return NextResponse.json({ message: 'Dispute submitted successfully', dispute });
  } catch {
    return NextResponse.json({ error: 'Failed to submit dispute.' }, { status: 500 });
  }
}
