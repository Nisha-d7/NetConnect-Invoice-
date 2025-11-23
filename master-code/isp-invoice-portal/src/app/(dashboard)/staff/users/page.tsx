'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface User {
  _id: string;
  email: string;
  role: 'customer' | 'staff';
  createdAt?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  serviceInfo?: {
    plan?: string;
    speed?: string;
    monthlyRate?: number;
    installationDate?: string;
    status?: 'Active' | 'Suspended' | 'Cancelled';
  };
  lastLogin?: string;
  isActive?: boolean;
}

interface Invoice {
  _id: string;
  customerEmail: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
}

const StaffUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'customer' | 'staff'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, invoicesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/invoices')
      ]);
      
      const usersData = await usersRes.json();
      const invoicesData = await invoicesRes.json();
      
      setUsers(usersData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (filter === 'all') return users;
    return users.filter(user => user.role === filter);
  };

  const getUserInvoices = (userEmail: string) => {
    return invoices.filter(invoice => invoice.customerEmail === userEmail);
  };

  const getUserStats = (userEmail: string) => {
    const userInvoices = getUserInvoices(userEmail);
    return {
      totalInvoices: userInvoices.length,
      totalAmount: userInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: userInvoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: userInvoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.amount, 0),
      overdueAmount: userInvoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0),
    };
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setShowCreateUserModal(false);
        alert('User created successfully!');
      } else {
        alert('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (userData: any) => {
    try {
      const response = await fetch(`/api/users/${selectedUser?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u._id === selectedUser?._id ? updatedUser : u));
        setShowEditUserModal(false);
        setSelectedUser(null);
        alert('User updated successfully!');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(`/api/users/${userToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userToDelete._id));
        setShowDeleteConfirmModal(false);
        setUserToDelete(null);
        alert('User deleted successfully!');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getRoleColor = (role: string) => {
    return role === 'staff' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="text-gray-600">Manage customers and staff members</p>
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 110-5.292M21 21H3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.role === 'customer').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff Members</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.role === 'staff').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
              <div className="flex space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="staff">Staff</option>
                </select>
                <Button 
                  variant="primary" 
                  onClick={() => setShowCreateUserModal(true)}
                  className="text-sm"
                >
                  Create User
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Invoices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredUsers().map((user) => {
                  const stats = getUserStats(user.email);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stats.totalInvoices}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stats.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(stats.pendingAmount + stats.overdueAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 mr-3"
                        >
                          Delete
                        </button>
                        {user.role === 'customer' && (
                          <Link
                            href={`/staff/create-invoice?customer=${user.email}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Create Invoice
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {getFilteredUsers().length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No users found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                {selectedUser.customerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                    <p className="text-sm text-gray-900">{selectedUser.customerId}</p>
                  </div>
                )}
                {(selectedUser.firstName || selectedUser.lastName) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.firstName || ''} {selectedUser.lastName || ''}
                    </p>
                  </div>
                )}
                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}
                {selectedUser.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedUser.lastLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="text-sm text-gray-900">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedUser.isActive !== false ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Customer-specific Info */}
              {selectedUser.role === 'customer' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Customer Details</h4>
                  
                  {/* Address Information */}
                  {selectedUser.address && (Object.keys(selectedUser.address).some(key => selectedUser.address?.[key as keyof typeof selectedUser.address])) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <div className="text-sm text-gray-900 space-y-1">
                        {selectedUser.address.street && <p>{selectedUser.address.street}</p>}
                        <p>
                          {selectedUser.address.city && selectedUser.address.city}
                          {selectedUser.address.city && selectedUser.address.state && ', '}
                          {selectedUser.address.state && selectedUser.address.state}
                          {(selectedUser.address.city || selectedUser.address.state) && selectedUser.address.zipCode && ' '}
                          {selectedUser.address.zipCode && selectedUser.address.zipCode}
                        </p>
                        {selectedUser.address.country && <p>{selectedUser.address.country}</p>}
                      </div>
                    </div>
                  )}

                  {/* Service Information */}
                  {selectedUser.serviceInfo && (Object.keys(selectedUser.serviceInfo).some(key => selectedUser.serviceInfo?.[key as keyof typeof selectedUser.serviceInfo])) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Information</label>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {selectedUser.serviceInfo.plan && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Plan:</span>
                            <span className="font-medium">{selectedUser.serviceInfo.plan}</span>
                          </div>
                        )}
                        {selectedUser.serviceInfo.speed && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Speed:</span>
                            <span className="font-medium">{selectedUser.serviceInfo.speed}</span>
                          </div>
                        )}
                        {selectedUser.serviceInfo.monthlyRate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Rate:</span>
                            <span className="font-medium">{formatCurrency(selectedUser.serviceInfo.monthlyRate)}</span>
                          </div>
                        )}
                        {selectedUser.serviceInfo.installationDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Installation Date:</span>
                            <span className="font-medium">{new Date(selectedUser.serviceInfo.installationDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedUser.serviceInfo.status && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service Status:</span>
                            <span className={`font-medium ${
                              selectedUser.serviceInfo.status === 'Active' ? 'text-green-600' :
                              selectedUser.serviceInfo.status === 'Suspended' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {selectedUser.serviceInfo.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Invoice Summary */}
                  {(() => {
                    const stats = getUserStats(selectedUser.email);
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Summary</label>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Invoices:</span>
                            <span className="font-medium">{stats.totalInvoices}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">{formatCurrency(stats.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paid:</span>
                            <span className="font-medium text-green-600">{formatCurrency(stats.paidAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium text-yellow-600">{formatCurrency(stats.pendingAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Overdue:</span>
                            <span className="font-medium text-red-600">{formatCurrency(stats.overdueAmount)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* User Invoices */}
            {selectedUser.role === 'customer' && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Invoices</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getUserInvoices(selectedUser.email).slice(0, 5).map((invoice: any) => (
                        <tr key={invoice._id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(invoice.amount)}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === 'Paid' ? 'text-green-600 bg-green-100' :
                              invoice.status === 'Pending' ? 'text-yellow-600 bg-yellow-100' :
                              'text-red-600 bg-red-100'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedUser.role === 'customer' && (
                <Link
                  href={`/staff/create-invoice?customer=${selectedUser.email}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Create Invoice
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <CreateUserModal
          onClose={() => setShowCreateUserModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditUserModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onClose={() => {
            setShowDeleteConfirmModal(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDeleteUser}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: React.FC<{
  onClose: () => void;
  onSubmit: (userData: any) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    serviceInfo: {
      plan: '',
      speed: '',
      monthlyRate: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      } else if (parent === 'serviceInfo') {
        setFormData(prev => ({
          ...prev,
          serviceInfo: {
            ...prev.serviceInfo,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          {formData.role === 'customer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <select
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select Province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NU">Nunavut</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="YT">Yukon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="e.g., K1A 0A6"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Plan</label>
                  <input
                    type="text"
                    name="serviceInfo.plan"
                    value={formData.serviceInfo.plan}
                    onChange={handleChange}
                    placeholder="e.g., High Speed Internet"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Speed</label>
                  <input
                    type="text"
                    name="serviceInfo.speed"
                    value={formData.serviceInfo.speed}
                    onChange={handleChange}
                    placeholder="e.g., 100 Mbps"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    name="serviceInfo.monthlyRate"
                    value={formData.serviceInfo.monthlyRate}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: User;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}> = ({ user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    role: user.role,
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    serviceInfo: {
      plan: '',
      speed: '',
      monthlyRate: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'address') {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [child]: value
          }
        }));
      } else if (parent === 'serviceInfo') {
        setFormData(prev => ({
          ...prev,
          serviceInfo: {
            ...prev.serviceInfo,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          {formData.role === 'customer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <select
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select Province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="NU">Nunavut</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="YT">Yukon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="e.g., K1A 0A6"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service Plan</label>
                  <input
                    type="text"
                    name="serviceInfo.plan"
                    value={formData.serviceInfo.plan}
                    onChange={handleChange}
                    placeholder="e.g., High Speed Internet"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Speed</label>
                  <input
                    type="text"
                    name="serviceInfo.speed"
                    value={formData.serviceInfo.speed}
                    onChange={handleChange}
                    placeholder="e.g., 100 Mbps"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    name="serviceInfo.monthlyRate"
                    value={formData.serviceInfo.monthlyRate}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmModal: React.FC<{
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ user, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the user <strong>{user.email}</strong>? This action cannot be undone.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffUsersPage;
