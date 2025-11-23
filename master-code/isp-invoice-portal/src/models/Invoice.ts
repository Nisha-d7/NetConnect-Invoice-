import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  tax?: number;
  discount?: number;
  description?: string;
  notes?: string;
  status: string;
}

const InvoiceSchema: Schema = new Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: String, required: true },
  dueDate: { type: String },
  amount: { type: Number, required: true },
  tax: { type: Number },
  discount: { type: Number },
  description: { type: String },
  notes: { type: String },
  status: { type: String, default: 'Pending' }
});

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);