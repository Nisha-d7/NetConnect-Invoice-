// StaffCreateInvoicePage: Dedicated page for staff to create new invoices
// Uses the reusable InvoiceEntryForm component and submits to the API
// Shows a success message and redirects to dashboard after creation

"use client";
import React from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import InvoiceEntryForm from "@/components/forms/InvoiceEntryForm";
import Button from "@/components/ui/Button";

const StaffCreateInvoicePage: React.FC = () => {
  // State to show success message after invoice creation
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editData, setEditData] = React.useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerEmail = searchParams.get('customer');
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  // Fetch invoice data for editing
  React.useEffect(() => {
    if (isEditing) {
      fetchInvoiceData();
    }
  }, [editId]);

  const fetchInvoiceData = async () => {
    if (!editId) return;
    try {
      const response = await fetch(`/api/invoices/${editId}`);
      if (response.ok) {
        const invoice = await response.json();
        setEditData(invoice);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  };

  const initialData = React.useMemo(() => {
    if (editData) {
      return {
        customerName: editData.customerName || '',
        customerEmail: editData.customerEmail || '',
        invoiceNumber: editData.invoiceNumber || '',
        invoiceDate: editData.invoiceDate ? new Date(editData.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : '',
        amount: editData.amount || 0,
        status: editData.status || 'Pending',
        serviceType: editData.serviceType || '',
        billingPeriod: editData.billingPeriod || '',
        description: editData.description || '',
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Default 30 days due date
    
    return {
      customerEmail: customerEmail || '',
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: today,
      dueDate: dueDate.toISOString().split('T')[0],
      serviceType: 'Internet Service',
      billingPeriod: 'Monthly',
      description: '',
    };
  }, [editData, customerEmail]);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/invoices/${editId}` : "/api/invoices";
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSuccess(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/staff/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Failed to ${isEditing ? 'update' : 'create'} invoice: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} invoice:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} invoice. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update invoice details' : 'Generate a new invoice for customer services'}
              </p>
            </div>
            <Link href="/staff/dashboard">
              <Button variant="secondary">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Success message */}
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    Invoice {isEditing ? 'updated' : 'created'} successfully!
                  </span>
                </div>
                <p className="mt-1 text-sm">Redirecting to dashboard...</p>
              </div>
            )}

            {/* Invoice entry form */}
            <InvoiceEntryForm
              initialData={initialData}
              onSubmit={handleSubmit}
            />

            {loading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Creating invoice...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCreateInvoicePage;