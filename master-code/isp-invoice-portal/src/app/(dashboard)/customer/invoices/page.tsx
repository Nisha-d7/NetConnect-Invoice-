// CustomerDashboard: Main dashboard page for listing, filtering, editing, and deleting invoices

'use client';
import React, { useState, useEffect } from 'react';
import InvoiceFilterDropdown from '@/components/invoice/InvoiceFilterDropdown';
import InvoiceEntryForm from '@/components/forms/InvoiceEntryForm';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '@/lib/pdf/InvoicePDF';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRouter } from 'next/navigation';

const CustomerDashboard: React.FC = () => {
  // Get current user info
  const { user, loading: userLoading, logout } = useCurrentUser();
  const router = useRouter();
  
  // State for all invoices (unfiltered), filtered invoices, filter type, loading, and edit modal
  const [allInvoices, setAllInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('Monthly');
  const [loading, setLoading] = useState(true);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  // ALL useEffect hooks must be before any conditional returns
  // Redirect if not customer user
  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'customer')) {
      router.push('/login?role=customer');
    }
  }, [user, userLoading, router]);

  // Fetch all invoices from API on mount
  useEffect(() => {
    // Only fetch if user is authenticated and is customer
    if (!userLoading && user && user.role === 'customer') {
      async function fetchInvoices() {
        setLoading(true);
        const res = await fetch('/api/invoices');
        const data = await res.json();
        setAllInvoices(data);
        // Apply filter after fetch
        const currentYear = new Date().getFullYear();
        let filtered = data;
        if (filter === 'Monthly') {
          filtered = data.filter((invoice: any) => new Date(invoice.invoiceDate).getFullYear() === currentYear);
        }
        setInvoices(filtered);
        setLoading(false);
      }
      fetchInvoices();
    }
  }, [user, userLoading, filter]);

  // Handle changes in the edit modal form fields
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // Handle edit form submission (PUT to API, refresh list)
  const handleEditSubmit = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditInvoiceId(null);
    setEditForm(null);
    // Refresh invoice list after edit
    const res = await fetch('/api/invoices');
    const data = await res.json();
    setAllInvoices(data);
    const currentYear = new Date().getFullYear();
    let filtered = data;
    if (filter === 'Monthly') {
      filtered = data.filter((inv: any) => new Date(inv.invoiceDate).getFullYear() === currentYear);
    }
    setInvoices(filtered);
  };

  const generatePDF = async (invoice: any) => {
    console.log('Generating PDF for invoice:', invoice);
    try {
      const pdfDoc = pdf(<InvoicePDF invoice={invoice} />);
      const blob = await pdfDoc.toBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.invoiceNumber || 'unknown'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Client-side PDF error:', error.message);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated or not customer
  if (!user || user.role !== 'customer') {
    return null;
  }

  // Handle filter dropdown change (Monthly/Yearly)
  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    const currentYear = new Date().getFullYear();
    let filteredInvoices = [...allInvoices];
    if (filter === 'Monthly') {
      filteredInvoices = allInvoices.filter((invoice: any) => {
        const year = new Date(invoice.invoiceDate).getFullYear();
        return year === currentYear;
      });
    }
    setInvoices(filteredInvoices);
  };


  console.log('Rendered invoices:', invoices);
  return (
    <React.Fragment>
      <div style={{ overflow: 'visible' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            {user && (
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user.firstName || user.email}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div>
          <p>Filter Dropdown Should Be Here: </p>
          <InvoiceFilterDropdown onSelect={handleFilterChange} />
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Invoice List</h2>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length > 0 ? (
                  invoices.map((invoice: any) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{invoice.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{invoice.invoiceDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">${invoice.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{invoice.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-600 hover:underline mr-2"
                          onClick={() => {
                            setEditInvoiceId(invoice._id);
                            setEditForm(invoice);
                          }}
                        >Edit</button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this invoice?')) {
                              await fetch(`/api/invoices/${invoice._id}`, { method: 'DELETE' });

                              const res = await fetch('/api/invoices');
                              const data = await res.json();
                              setAllInvoices(data);
                              const currentYear = new Date().getFullYear();
                              let filtered = data;
                              if (filter === 'Monthly') {
                                filtered = data.filter((inv: any) => new Date(inv.invoiceDate).getFullYear() === currentYear);
                              }
                              setInvoices(filtered);
                            }
                          }}
                        >Delete</button>
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() => generatePDF(invoice)}
                        > PDF</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No invoices found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>


        {/* Editing invoice */}
        {editInvoiceId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white text-black p-6 rounded shadow-lg w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => { setEditInvoiceId(null); setEditForm(null); }}
              >&#10005;</button>
              <h2 className="text-lg font-bold mb-4">Edit Invoice</h2>
              <form onSubmit={e => handleEditSubmit(e, editInvoiceId)}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Customer</label>
                    <input type="text" name="customerName" value={editForm?.customerName || ''} onChange={handleEditChange} className="p-1 border rounded w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" name="customerEmail" value={editForm?.customerEmail || ''} onChange={handleEditChange} className="p-1 border rounded w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Invoice #</label>
                    <input type="text" name="invoiceNumber" value={editForm?.invoiceNumber || ''} onChange={handleEditChange} className="p-1 border rounded w-full" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Date</label>
                    <input type="date" name="invoiceDate" value={editForm?.invoiceDate ? editForm.invoiceDate.substring(0, 10) : ''} onChange={handleEditChange} className="p-1 border rounded w-full text-black bg-white" style={{ color: 'black', backgroundColor: 'white' }} required />

                  </div>
                  <div>
                    <label className="block text-sm font-medium">Amount</label>
                    <input type="number" name="amount" value={editForm?.amount || ''} onChange={handleEditChange} className="p-1 border rounded w-full text-black bg-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Tax</label>
                    <input type="number" name="tax" value={editForm?.tax || ''} onChange={handleEditChange} className="p-1 border rounded w-full text-black bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Discount</label>
                    <input type="number" name="discount" value={editForm?.discount || ''} onChange={handleEditChange} className="p-1 border rounded w-full text-black bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Status</label>
                    <select name="status" value={editForm?.status || 'Pending'} onChange={handleEditChange} className="p-1 border rounded w-full bg-white text-black" style={{ color: 'black', backgroundColor: 'white' }}>
                      <option value="Pending" className="bg-white text-black">Pending</option>
                      <option value="Paid" className="bg-white text-black">Paid</option>
                      <option value="Overdue" className="bg-white text-black">Overdue</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" value={editForm?.description || ''} onChange={handleEditChange} className="p-1 border rounded w-full text-black bg-white" style={{ color: 'black', backgroundColor: 'white' }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">Notes</label>
                    <textarea name="notes" value={editForm?.notes || ''} onChange={handleEditChange} className="p-1 border rounded w-full text-black bg-white" style={{ color: 'black', backgroundColor: 'white' }} />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
                  <button type="button" className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400" onClick={() => { setEditInvoiceId(null); setEditForm(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default CustomerDashboard;