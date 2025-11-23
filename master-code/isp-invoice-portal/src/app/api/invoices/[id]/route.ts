import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase as connectDB } from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getCurrentUser } from '@/lib/auth';

// GET a single invoice by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // If customer, only allow access to their own invoices
    if (currentUser.role === 'customer' && invoice.customerEmail !== currentUser.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// UPDATE an invoice by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();
    const { id } = await params;
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Only staff can update invoices, or customers can update their own invoices (limited fields)
    if (currentUser.role === 'customer') {
      if (invoice.customerEmail !== currentUser.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Customers can only update certain fields (like payment status)
      const allowedFields = ['status'];
      const filteredData: { [key: string]: any } = {};
      
      allowedFields.forEach(field => {
        if (field in data) {
          filteredData[field] = data[field];
        }
      });
      
      const updatedInvoice = await Invoice.findByIdAndUpdate(id, filteredData, { new: true });
      return NextResponse.json(updatedInvoice);
    } else if (currentUser.role === 'staff') {
      const updatedInvoice = await Invoice.findByIdAndUpdate(id, data, { new: true });
      return NextResponse.json(updatedInvoice);
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE an invoice by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Get current user from session
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only staff can delete invoices
    if (currentUser.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoice = await Invoice.findByIdAndDelete(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Invoice deleted' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
