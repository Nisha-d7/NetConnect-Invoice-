'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Dispute {
  _id: string;
  username: string;
  mobile: string;
  category: 'Dispute' | 'Enquiry';
  description: string;
  createdAt: string;
  status?: 'Open' | 'Resolved' | 'In Progress';
}

const StaffDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Dispute' | 'Enquiry'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Resolved' | 'In Progress'>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/disputes');
      const data = await response.json();
      setDisputes(data);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDisputes = () => {
    let filtered = disputes;
    
    if (filter !== 'all') {
      filtered = filtered.filter(dispute => dispute.category === filter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dispute => (dispute.status || 'Open') === statusFilter);
    }
    
    return filtered;
  };

  const handleResolveDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  const markAsResolved = async (disputeId: string) => {
    try {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          resolvedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const updatedDispute = await response.json();
        setDisputes(disputes.map(d => d._id === disputeId ? updatedDispute : d));
        alert('Dispute marked as resolved successfully!');
      } else {
        alert('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute');
    }
  };

  const handleContactCustomer = (dispute: Dispute) => {
    // Open email client or phone dialer
    const subject = encodeURIComponent(`Regarding your ${dispute.category.toLowerCase()}: ${dispute.description.substring(0, 50)}...`);
    const body = encodeURIComponent(`Dear ${dispute.username},\n\nWe are reaching out regarding your recent ${dispute.category.toLowerCase()}.\n\nOriginal message: "${dispute.description}"\n\nBest regards,\nCustomer Support Team`);
    
    // Try to open default email client
    const mailtoLink = `mailto:${dispute.username}@example.com?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    
    // Alternative: show phone number for quick reference
    alert(`Customer Phone: ${dispute.mobile}\n\nEmail draft opened in your default email client.`);
  };

  const getCategoryColor = (category: string) => {
    return category === 'Dispute' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Open': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Disputes Management</h1>
              <p className="text-gray-600">Manage customer disputes and enquiries</p>
            </div>
            <Link 
              href="/staff/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                <p className="text-2xl font-bold text-red-600">
                  {disputes.filter(d => d.category === 'Dispute').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
                <p className="text-2xl font-bold text-blue-600">
                  {disputes.filter(d => d.category === 'Enquiry').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {disputes.filter(d => !d.status || d.status === 'Open').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">All Disputes & Enquiries</h2>
              <div className="flex space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Dispute">Disputes</option>
                  <option value="Enquiry">Enquiries</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredDisputes().map((dispute) => (
                  <tr key={dispute._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{dispute.username}</div>
                        <div className="text-sm text-gray-500">{dispute.mobile}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(dispute.category)}`}>
                        {dispute.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {dispute.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status || 'Open')}`}>
                        {dispute.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleResolveDispute(dispute)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => markAsResolved(dispute._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark Resolved
                      </button>
                      <button 
                        onClick={() => handleContactCustomer(dispute)}
                        className="text-indigo-600 hover:text-indigo-900 ml-3"
                      >
                        Contact Customer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {getFilteredDisputes().length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No disputes found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for dispute details */}
      {showModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dispute Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <p className="text-sm text-gray-900">{selectedDispute.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile</label>
                <p className="text-sm text-gray-900">{selectedDispute.mobile}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedDispute.category)}`}>
                  {selectedDispute.category}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedDispute.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Submitted Date</label>
                <p className="text-sm text-gray-900">{new Date(selectedDispute.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDisputesPage;