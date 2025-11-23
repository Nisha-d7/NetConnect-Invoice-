import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase as connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Get current user from session
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let invoices;
    
    // If customer, only show their invoices
    if (currentUser.role === 'customer') {
      invoices = await Invoice.find({ customerEmail: currentUser.email });
    } 
    // If staff, show all invoices
    else if (currentUser.role === 'staff') {
      invoices = await Invoice.find();
    } 
    else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff can create invoices
    if (currentUser.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    const invoice = await Invoice.create(data);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}