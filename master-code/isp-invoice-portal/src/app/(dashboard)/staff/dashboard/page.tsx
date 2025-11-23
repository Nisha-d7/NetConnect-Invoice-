'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SimpleBarChart, SimplePieChart } from '@/components/charts/SimpleCharts';
import Button from '@/components/ui/Button';
import FilterDropdown from '@/components/invoice/FilterDropdown';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Invoice {
  _id: string;
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded' | 'Partially Paid';
  dueDate?: string;
  serviceType?: string;
  billingPeriod?: string;
  description?: string;
}

interface User {
  _id: string;
  email: string;
  role: 'customer' | 'staff';
}

interface Dispute {
  _id: string;
  username: string;
  mobile: string;
  category: 'Dispute' | 'Enquiry';
  description: string;
  createdAt: string;
  status?: 'Open' | 'Resolved' | 'In Progress';
}

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalDisputes: number;
  totalUsers: number;
  totalCustomers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

const StaffDashboard: React.FC = () => {
  // Authentication
  const { user, loading: userLoading, logout } = useCurrentUser();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalDisputes: 0,
    totalUsers: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'users' | 'disputes'>('overview');
  
  // Filter states
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'thisMonth' | 'thisYear'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'customer' | 'staff'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add state for invoice actions
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const router = useRouter();

  // ALL useEffect hooks must be before any conditional returns
  // Redirect if not staff user
  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'staff')) {
      router.push('/login?role=staff');
    }
  }, [user, userLoading, router]);

  // Fetch data effect
  useEffect(() => {
    // Only fetch data if user is authenticated and is staff
    if (!userLoading && user && user.role === 'staff') {
      fetchData();
    }
  }, [user, userLoading]);

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated or not staff
  if (!user || user.role !== 'staff') {
    return null;
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch invoices
      const invoicesRes = await fetch('/api/invoices');
      const invoicesData = await invoicesRes.json();
      setInvoices(invoicesData);

      // Fetch users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Fetch disputes
      const disputesRes = await fetch('/api/disputes');
      const disputesData = await disputesRes.json();
      setDisputes(disputesData);

      // Calculate stats
      calculateStats(invoicesData, usersData, disputesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoices: Invoice[], users: User[], disputes: Dispute[]) => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'Pending').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue').length;
    const totalDisputes = disputes.length;
    const totalUsers = users.length;
    const totalCustomers = users.filter(u => u.role === 'customer').length;

    // Calculate monthly and yearly revenue
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthlyRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth && inv.status === 'Paid';
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    const yearlyRevenue = invoices
      .filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate.getFullYear() === currentYear && inv.status === 'Paid';
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    setStats({
      totalInvoices,
      totalRevenue,
      pendingInvoices,
      paidInvoices,
      overdueInvoices,
      totalDisputes,
      totalUsers,
      totalCustomers,
      monthlyRevenue,
      yearlyRevenue,
    });
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;

    // Filter by status
    if (invoiceFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status.toLowerCase() === invoiceFilter);
    }

    // Filter by time
    if (timeFilter !== 'all') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      filtered = filtered.filter(inv => {
        const invoiceDate = new Date(inv.invoiceDate);
        if (timeFilter === 'thisYear') {
          return invoiceDate.getFullYear() === currentYear;
        }
        if (timeFilter === 'thisMonth') {
          return invoiceDate.getFullYear() === currentYear && 
                 invoiceDate.getMonth() === currentMonth;
        }
        return true;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inv => 
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by role
    if (userFilter !== 'all') {
      filtered = filtered.filter(user => user.role === userFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteModal(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoice) return;
    
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setInvoices(invoices.filter(inv => inv._id !== selectedInvoice._id));
        setShowDeleteModal(false);
        setSelectedInvoice(null);
      } else {
        alert('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice');
    }
  };

  const handleUpdateInvoice = async (updatedInvoiceData: any) => {
    if (!selectedInvoice) return;
    
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInvoiceData),
      });
      
      if (response.ok) {
        const updatedInvoice = await response.json();
        setInvoices(invoices.map(inv => inv._id === selectedInvoice._id ? updatedInvoice : inv));
        setShowEditModal(false);
        setSelectedInvoice(null);
        
        // Recalculate stats with updated data
        const updatedInvoices = invoices.map(inv => inv._id === selectedInvoice._id ? updatedInvoice : inv);
        calculateStats(updatedInvoices, users, disputes);
        
        alert('Invoice updated successfully!');
      } else {
        alert('Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice');
    }
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

  const handleResolveDispute = async (dispute: Dispute) => {
    try {
      const response = await fetch(`/api/disputes/${dispute._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dispute,
          status: 'Resolved',
          resolvedAt: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        const updatedDispute = await response.json();
        setDisputes(disputes.map(d => d._id === dispute._id ? updatedDispute : d));
        alert('Dispute resolved successfully!');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600">Manage invoices, customers, and disputes</p>
            {user && (
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user.firstName || user.email}
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-green-200 text-xs mt-1">Yearly: {formatCurrency(stats.yearlyRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                <p className="text-blue-200 text-xs mt-1">Paid: {stats.paidInvoices}</p>
              </div>
              <div className="h-12 w-12 bg-blue-400 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingInvoices}</p>
                <p className="text-yellow-200 text-xs mt-1">Overdue: {stats.overdueInvoices}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-purple-200 text-xs mt-1">Customers: {stats.totalCustomers}</p>
              </div>
              <div className="h-12 w-12 bg-purple-400 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 110-5.292M21 21H3" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Open Disputes</p>
                <p className="text-2xl font-bold">{disputes.filter(d => d.category === 'Dispute' && (!d.status || d.status === 'Open')).length}</p>
                <p className="text-red-200 text-xs mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 bg-red-400 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'invoices', label: 'Invoices' },
                { id: 'users', label: 'Users' },
                { id: 'disputes', label: 'Disputes' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link href="/staff/create-invoice" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Create New Invoice</h3>
                      <p className="text-gray-600">Generate a new invoice for customers</p>
                    </div>
                  </div>
                </Link>

                <Link href="/staff/users" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 110-5.292M21 21H3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                      <p className="text-gray-600">View and manage customer accounts</p>
                    </div>
                  </div>
                </Link>

                <Link href="/staff/disputes" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Handle Disputes</h3>
                      <p className="text-gray-600">Review and resolve customer issues</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleBarChart
                  title="Invoice Status Overview"
                  data={[
                    { label: 'Paid', value: stats.paidInvoices, color: '#10B981' },
                    { label: 'Pending', value: stats.pendingInvoices, color: '#F59E0B' },
                    { label: 'Overdue', value: stats.overdueInvoices, color: '#EF4444' }
                  ]}
                />
                <SimplePieChart
                  title="Customer Issues"
                  data={[
                    { label: 'Disputes', value: disputes.filter(d => d.category === 'Dispute' && (!d.status || d.status === 'Open')).length, color: '#EF4444' },
                    { label: 'Enquiries', value: disputes.filter(d => d.category === 'Enquiry' && (!d.status || d.status === 'Open')).length, color: '#3B82F6' }
                  ]}
                />
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Invoice Management</h2>
                <div className="flex flex-wrap gap-4">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FilterDropdown
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'overdue', label: 'Overdue' },
                    ]}
                    value={invoiceFilter}
                    onChange={(value) => setInvoiceFilter(value as any)}
                    placeholder="Filter by status"
                  />
                  <FilterDropdown
                    options={[
                      { value: 'all', label: 'All Time' },
                      { value: 'thisMonth', label: 'This Month' },
                      { value: 'thisYear', label: 'This Year' },
                    ]}
                    value={timeFilter}
                    onChange={(value) => setTimeFilter(value as any)}
                    placeholder="Filter by time"
                  />
                </div>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredInvoices().slice(0, 10).map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                            <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleViewInvoice(invoice)}>View</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleEditInvoice(invoice)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteInvoice(invoice)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {getFilteredInvoices().length === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">No invoices found matching your filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              {/* User Filters */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" onClick={() => setShowCreateUserModal(true)}>
                    + Create User
                  </Button>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FilterDropdown
                    options={[
                      { value: 'all', label: 'All Roles' },
                      { value: 'customer', label: 'Customers' },
                      { value: 'staff', label: 'Staff' },
                    ]}
                    value={userFilter}
                    onChange={(value) => setUserFilter(value as any)}
                    placeholder="Filter by role"
                  />
                </div>
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredUsers().map((user) => {
                  const userInvoices = invoices.filter(inv => inv.customerEmail === user.email);
                  const userRevenue = userInvoices.reduce((sum, inv) => sum + inv.amount, 0);
                  const paidInvoices = userInvoices.filter(inv => inv.status === 'Paid').length;
                  const pendingInvoices = userInvoices.filter(inv => inv.status === 'Pending').length;

                  return (
                    <div key={user._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.role === 'staff' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{user.email}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'staff' ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {user.role === 'customer' && (
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Total Revenue:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(userRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Invoices:</span>
                            <span>{userInvoices.length} total</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span>
                              <span className="text-green-600">{paidInvoices} paid</span>
                              {pendingInvoices > 0 && <span className="text-yellow-600">, {pendingInvoices} pending</span>}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex space-x-2">
                        {user.role === 'customer' && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            fullWidth
                            onClick={() => router.push(`/staff/create-invoice?customer=${user.email}`)}
                          >
                            Create Invoice
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="primary" 
                          fullWidth
                          onClick={() => router.push('/staff/users')}
                        >
                          Manage Users
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {getFilteredUsers().length === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">No users found matching your filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Dispute Management</h2>
                <Link href="/staff/disputes" className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                  View All Disputes
                </Link>
              </div>
              
              <div className="space-y-4">
                {disputes.slice(0, 10).map((dispute) => (
                  <div key={dispute._id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">{dispute.username}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            dispute.category === 'Dispute' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'
                          }`}>
                            {dispute.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{dispute.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Mobile: {dispute.mobile}</span>
                          <span>Created: {new Date(dispute.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          size="sm" 
                          variant="success"
                          onClick={() => handleResolveDispute(dispute)}
                        >
                          Resolve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleContactCustomer(dispute)}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {disputes.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500">No disputes found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Email</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.customerEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
              </div>
              {selectedInvoice.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Invoice Modal */}
      {showEditModal && selectedInvoice && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateInvoice}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Invoice</h3>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete invoice {selectedInvoice.invoiceNumber}? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteInvoice}>
                Delete
              </Button>
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
    </div>
  );
};

export default StaffDashboard;

// Edit Invoice Modal Component
const EditInvoiceModal: React.FC<{
  invoice: Invoice;
  onClose: () => void;
  onSubmit: (invoiceData: any) => void;
}> = ({ invoice, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: invoice.customerName || '',
    customerEmail: invoice.customerEmail || '',
    invoiceNumber: invoice.invoiceNumber || '',
    invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
    dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
    amount: invoice.amount.toString() || '',
    status: invoice.status || 'Pending',
    serviceType: invoice.serviceType || '',
    billingPeriod: invoice.billingPeriod || '',
    description: invoice.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.customerName || !formData.customerEmail || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    // Convert amount to number
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      amount,
      invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : invoice.invoiceDate,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : invoice.dueDate,
    };

    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 p-6 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Invoice number cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Service Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <input
                  type="text"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  placeholder="e.g., Internet Service, Cable TV"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                <input
                  type="text"
                  name="billingPeriod"
                  value={formData.billingPeriod}
                  onChange={handleChange}
                  placeholder="e.g., January 2025, Q1 2025"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Additional details about the service or invoice..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Invoice
            </Button>
          </div>
        </form>
      </div>
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
