// InvoiceEntryForm: Reusable form component for creating or editing invoice records
// components/forms/InvoiceEntryForm.tsx
import React, { useState, useEffect } from 'react';

interface InvoiceEntryFormProps {
  onSubmit: (formData: any) => void;
  initialData?: Partial<{
    customerName: string;
    customerEmail: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: string;
    tax: string;
    discount: string;
    description: string;
    notes: string;
    status: string;
    serviceType: string;
    billingPeriod: string;
  }>;
}

const InvoiceEntryForm: React.FC<InvoiceEntryFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    amount: '',
    tax: '13', // Default 13% tax for Canadian ISP services
    discount: '',
    description: '',
    notes: '',
    status: 'Pending',
    serviceType: 'Internet Service',
    billingPeriod: 'Monthly',
  });

  const [emailValidation, setEmailValidation] = useState({
    isValidating: false,
    isValid: false,
    message: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  const validateEmail = async (email: string) => {
    if (!email) {
      setEmailValidation({ isValidating: false, isValid: false, message: '' });
      return;
    }

    setEmailValidation({ isValidating: true, isValid: false, message: 'Checking...' });
    
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      const userExists = users.some((user: any) => user.email === email);
      
      if (userExists) {
        setEmailValidation({ isValidating: false, isValid: true, message: '✓ User found' });
      } else {
        setEmailValidation({ 
          isValidating: false, 
          isValid: false, 
          message: '✗ User with this email does not exist in the system' 
        });
      }
    } catch (error) {
      setEmailValidation({ 
        isValidating: false, 
        isValid: false, 
        message: 'Error validating email' 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate email when it changes
    if (name === 'customerEmail') {
      const timeoutId = setTimeout(() => validateEmail(value), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if email is valid before submitting
    if (!emailValidation.isValid && formData.customerEmail) {
      alert('Please enter a valid email address that exists in the system.');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name *</label>
          <input
            type="text"
            name="customerName"
            id="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">Customer Email *</label>
          <input
            type="email"
            name="customerEmail"
            id="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className={`mt-1 p-3 w-full border rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              emailValidation.message && !emailValidation.isValid && formData.customerEmail
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : emailValidation.isValid
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300'
            }`}
            required
          />
          {emailValidation.message && (
            <p className={`text-sm mt-1 ${
              emailValidation.isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {emailValidation.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice Number *</label>
          <input
            type="text"
            name="invoiceNumber"
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            readOnly
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Pending">Pending Payment</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type *</label>
          <select
            name="serviceType"
            id="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="Internet Service">Internet Service</option>
            <option value="Cable TV">Cable TV</option>
            <option value="Phone Service">Phone Service</option>
            <option value="Bundled Package">Bundled Package</option>
            <option value="Installation Fee">Installation Fee</option>
            <option value="Equipment Rental">Equipment Rental</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Late Fee">Late Fee</option>
          </select>
        </div>
        <div>
          <label htmlFor="billingPeriod" className="block text-sm font-medium text-gray-700">Billing Period *</label>
          <select
            name="billingPeriod"
            id="billingPeriod"
            value={formData.billingPeriod}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Semi-Annual">Semi-Annual</option>
            <option value="Annual">Annual</option>
            <option value="One-time">One-time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">Invoice Date *</label>
          <input
            type="date"
            name="invoiceDate"
            id="invoiceDate"
            value={formData.invoiceDate}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Base Amount *</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            id="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-gray-700">Tax (%)</label>
          <input
            type="number"
            step="0.01"
            name="tax"
            id="tax"
            value={formData.tax}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700">Discount (%)</label>
          <input
            type="number"
            step="0.01"
            name="discount"
            id="discount"
            value={formData.discount}
            onChange={handleChange}
            className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Service Description</label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the service provided"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes</label>
        <textarea
          name="notes"
          id="notes"
          rows={2}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional notes or special instructions"
          className="mt-1 p-3 w-full border border-gray-300 rounded-md text-black bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
      >
        Create Invoice
      </button>
    </form>
  );
};

export default InvoiceEntryForm;