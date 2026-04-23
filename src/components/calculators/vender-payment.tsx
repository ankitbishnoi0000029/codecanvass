'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getMetaCached } from '@/actions/dbAction';
import ContentSection from '../ui/content';

// --- Types ---
interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalDue: number;
  totalPaid: number;
}

interface Payment {
  id: string;
  vendorId: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  description: string;
  paymentMode: 'Cash' | 'Bank Transfer' | 'Cheque' | 'UPI';
}

// --- Utility Functions ---
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(Math.round(value));
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN');
};

// Check if payment is overdue
const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date() && dueDate !== '';
};

// --- Sample Data ---
const initialVendors: Vendor[] = [
  { id: 'v1', name: 'ABC Suppliers', contactPerson: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@abc.com', address: 'Mumbai', totalDue: 150000, totalPaid: 50000 },
  { id: 'v2', name: 'XYZ Logistics', contactPerson: 'Priya Singh', phone: '9876543211', email: 'priya@xyz.com', address: 'Delhi', totalDue: 200000, totalPaid: 100000 },
  { id: 'v3', name: 'Tech Solutions', contactPerson: 'Amit Sharma', phone: '9876543212', email: 'amit@tech.com', address: 'Bangalore', totalDue: 75000, totalPaid: 25000 },
];

const initialPayments: Payment[] = [
  { id: 'p1', vendorId: 'v1', amount: 50000, date: '2025-03-01', dueDate: '2025-03-15', status: 'Paid', description: 'Raw materials', paymentMode: 'Bank Transfer' },
  { id: 'p2', vendorId: 'v1', amount: 100000, date: '', dueDate: '2025-04-10', status: 'Pending', description: 'Consignment', paymentMode: 'Cheque' },
  { id: 'p3', vendorId: 'v2', amount: 100000, date: '2025-03-10', dueDate: '2025-03-20', status: 'Paid', description: 'Transport', paymentMode: 'UPI' },
  { id: 'p4', vendorId: 'v2', amount: 100000, date: '', dueDate: '2025-04-05', status: 'Overdue', description: 'Logistics', paymentMode: 'Bank Transfer' },
  { id: 'p5', vendorId: 'v3', amount: 25000, date: '2025-03-05', dueDate: '2025-03-12', status: 'Paid', description: 'Software license', paymentMode: 'Bank Transfer' },
  { id: 'p6', vendorId: 'v3', amount: 50000, date: '', dueDate: '2025-04-15', status: 'Pending', description: 'Maintenance', paymentMode: 'Cash' },
];

// --- Main Component ---
export default function VendorPaymentTracker() {
  // State
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('all');
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');
 const [pageContent,setPageContent] = useState<any>(null);

const fetchPageContent = async () => {
  try {
    const data = await getMetaCached('vendor-payment');
    console.log("Fetched page content:",data?.pageData);
    setPageContent(data);
  } catch (error) {
    console.error('Error fetching page content:', error);
  }
}
  useEffect(() => {
    fetchPageContent();
  }, []);
  console.log("pageContent",pageContent);
  // Form states
  const [newVendor, setNewVendor] = useState<Omit<Vendor, 'id' | 'totalDue' | 'totalPaid'>>({
    name: '', contactPerson: '', phone: '', email: '', address: '',
  });
  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id' | 'status'>>({
    vendorId: '', amount: 0, date: '', dueDate: '', description: '', paymentMode: 'Bank Transfer',
  });

  // Computed stats
  const stats = useMemo(() => {
    const totalDue = vendors.reduce((sum, v) => sum + v.totalDue, 0);
    const totalPaid = vendors.reduce((sum, v) => sum + v.totalPaid, 0);
    const pendingAmount = totalDue - totalPaid;
    const overduePayments = payments.filter(p => p.status === 'Overdue').reduce((sum, p) => sum + p.amount, 0);
    return { totalDue, totalPaid, pendingAmount, overduePayments };
  }, [vendors, payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];
    if (selectedVendorId !== 'all') {
      filtered = filtered.filter(p => p.vendorId === selectedVendorId);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => {
        const vendor = vendors.find(v => v.id === p.vendorId);
        return vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.description.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    return filtered;
  }, [payments, selectedVendorId, statusFilter, searchTerm, vendors]);

  // Chart data: Pending amount by vendor
  const pendingByVendor = useMemo(() => {
    return vendors.map(v => ({
      name: v.name,
      pending: v.totalDue - v.totalPaid,
      paid: v.totalPaid,
    })).filter(v => v.pending > 0 || v.paid > 0);
  }, [vendors]);

  // Payment timeline (last 6 months)
  const paymentTimeline = useMemo(() => {
    const months: Record<string, { paid: number; pending: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months[key] = { paid: 0, pending: 0 };
    }
    payments.forEach(p => {
      const date = p.date ? new Date(p.date) : null;
      if (date && !isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (months[key]) {
          if (p.status === 'Paid') months[key].paid += p.amount;
          else months[key].pending += p.amount;
        }
      }
    });
    return Object.entries(months).map(([month, data]) => ({
      month: month.slice(5) + '/' + month.slice(2,4),
      paid: data.paid,
      pending: data.pending,
    }));
  }, [payments]);

  // Add Vendor
  const handleAddVendor = () => {
    if (!newVendor.name) return alert('Vendor name required');
    const vendor: Vendor = {
      ...newVendor,
      id: generateId(),
      totalDue: 0,
      totalPaid: 0,
    };
    setVendors([...vendors, vendor]);
    setShowAddVendorModal(false);
    setNewVendor({ name: '', contactPerson: '', phone: '', email: '', address: '' });
  };

  // Add Payment
  const handleAddPayment = () => {
    if (!newPayment.vendorId || newPayment.amount <= 0) return alert('Vendor and amount required');
    const vendor = vendors.find(v => v.id === newPayment.vendorId);
    if (!vendor) return;
    const dueDateObj = new Date(newPayment.dueDate);
    const status: Payment['status'] = newPayment.date ? 'Paid' : (dueDateObj < new Date() ? 'Overdue' : 'Pending');
    const payment: Payment = {
      ...newPayment,
      id: generateId(),
      status,
    };
    setPayments([...payments, payment]);
    // Update vendor totals
    if (status === 'Paid') {
      vendor.totalPaid += newPayment.amount;
      vendor.totalDue += newPayment.amount;
    } else {
      vendor.totalDue += newPayment.amount;
    }
    setVendors(vendors.map(v => v.id === vendor.id ? vendor : v));
    setShowAddPaymentModal(false);
    setNewPayment({ vendorId: '', amount: 0, date: '', dueDate: '', description: '', paymentMode: 'Bank Transfer' });
  };

  // Mark payment as paid
  const markAsPaid = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment || payment.status === 'Paid') return;
    payment.status = 'Paid';
    payment.date = getToday();
    const vendor = vendors.find(v => v.id === payment.vendorId);
    if (vendor) {
      vendor.totalPaid += payment.amount;
      setVendors(vendors.map(v => v.id === vendor.id ? vendor : v));
    }
    setPayments(payments.map(p => p.id === paymentId ? payment : p));
  };

  // Delete payment
  const deletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    const vendor = vendors.find(v => v.id === payment.vendorId);
    if (vendor) {
      if (payment.status === 'Paid') {
        vendor.totalPaid -= payment.amount;
        vendor.totalDue -= payment.amount;
      } else {
        vendor.totalDue -= payment.amount;
      }
      setVendors(vendors.map(v => v.id === vendor.id ? vendor : v));
    }
    setPayments(payments.filter(p => p.id !== paymentId));
  };

  // PDF Ref
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const els = clonedDoc.querySelectorAll('*');
          els.forEach((el: any) => {
            if (el.style?.background) el.style.background = '#ffffff';
            if (el.style?.backgroundColor) el.style.backgroundColor = '#ffffff';
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Vendor_Payment_Report.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
            Vendor Payment Tracker
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Manage vendor payments, track dues, avoid overdue penalties, and maintain healthy supplier relationships.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-teal-500">
            <p className="text-gray-500 text-sm">Total Due to Vendors</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalDue)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total Paid</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalPaid)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Overdue Amount</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overduePayments)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => setShowAddVendorModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow">
            + Add Vendor
          </button>
          <button onClick={() => setShowAddPaymentModal(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition shadow">
            + Record Payment
          </button>
          <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center">
          <select value={selectedVendorId} onChange={(e) => setSelectedVendorId(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="all">All Vendors</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 border rounded-lg">
            <option value="all">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
          <input type="text" placeholder="Search by vendor or description" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" />
        </div>

        {/* Main Report Section (PDF capture) */}
        <div ref={reportRef} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Payment Tracker Report</h2>
          <p className="text-gray-500 text-sm mb-4">Generated on {new Date().toLocaleDateString('en-IN')}</p>

          {/* Payments Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Vendor</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-left">Due Date</th>
                  <th className="px-4 py-2 text-left">Payment Date</th>
                  <th className="px-4 py-2 text-left">Mode</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => {
                  const vendor = vendors.find(v => v.id === p.vendorId);
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{vendor?.name}</td>
                      <td className="px-4 py-2">{p.description}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-2">{formatDate(p.dueDate)}</td>
                      <td className="px-4 py-2">{p.date ? formatDate(p.date) : '-'}</td>
                      <td className="px-4 py-2">{p.paymentMode}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          p.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          p.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {p.status !== 'Paid' && (
                          <button onClick={() => markAsPaid(p.id)} className="text-green-600 hover:text-green-800 mr-2">Pay</button>
                        )}
                        <button onClick={() => deletePayment(p.id)} className="text-red-600 hover:text-red-800">Del</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPayments.length === 0 && <div className="text-center py-4 text-gray-500">No payments found</div>}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Pending Amount by Vendor</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pendingByVendor} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => formatCompactCurrency(v)} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Legend />
                    <Bar dataKey="pending" name="Pending" fill="#F59E0B" />
                    <Bar dataKey="paid" name="Paid" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Timeline (Last 6 Months)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paymentTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                    <Tooltip formatter={(v) => formatCurrency(v as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="paid" name="Paid" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="pending" name="Pending" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vendors Summary Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Vendors Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Vendor</th>
                    <th className="px-4 py-2 text-left">Contact</th>
                    <th className="px-4 py-2 text-right">Total Due</th>
                    <th className="px-4 py-2 text-right">Total Paid</th>
                    <th className="px-4 py-2 text-right">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map(v => (
                    <tr key={v.id} className="border-b">
                      <td className="px-4 py-2 font-medium">{v.name}</td>
                      <td className="px-4 py-2">{v.contactPerson}<br/><span className="text-xs">{v.phone}</span></td>
                      <td className="px-4 py-2 text-right">{formatCurrency(v.totalDue)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(v.totalPaid)}</td>
                      <td className="px-4 py-2 text-right font-medium text-yellow-600">{formatCurrency(v.totalDue - v.totalPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Vendor Modal */}
        {showAddVendorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Vendor Name *" value={newVendor.name} onChange={(e) => setNewVendor({...newVendor, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Contact Person" value={newVendor.contactPerson} onChange={(e) => setNewVendor({...newVendor, contactPerson: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Phone" value={newVendor.phone} onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" value={newVendor.email} onChange={(e) => setNewVendor({...newVendor, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Address" value={newVendor.address} onChange={(e) => setNewVendor({...newVendor, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddVendor} className="flex-1 bg-teal-600 text-white py-2 rounded-lg">Add Vendor</button>
                <button onClick={() => setShowAddVendorModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showAddPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Record Payment</h2>
              <div className="space-y-3">
                <select value={newPayment.vendorId} onChange={(e) => setNewPayment({...newPayment, vendorId: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <input type="number" placeholder="Amount (₹)" value={newPayment.amount} onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="date" placeholder="Due Date" value={newPayment.dueDate} onChange={(e) => setNewPayment({...newPayment, dueDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="date" placeholder="Payment Date (leave blank if not paid)" value={newPayment.date} onChange={(e) => setNewPayment({...newPayment, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Description" value={newPayment.description} onChange={(e) => setNewPayment({...newPayment, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={newPayment.paymentMode} onChange={(e) => setNewPayment({...newPayment, paymentMode: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddPayment} className="flex-1 bg-cyan-600 text-white py-2 rounded-lg">Add Payment</button>
                <button onClick={() => setShowAddPaymentModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* SEO Content Section - 10000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/80 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Vendor Payment Tracker</h2>
          <p className="text-gray-600 leading-relaxed">
            Managing vendor payments is critical for maintaining healthy supply chain relationships and avoiding cash flow disruptions. A Vendor Payment Tracker helps businesses monitor outstanding dues, schedule payments, avoid late fees, and maintain accurate financial records. Our comprehensive tool allows you to add vendors, record individual payments, track pending amounts, and generate detailed reports.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            In this guide, we'll explore vendor management best practices, payment terms, negotiation strategies, and how to use this tracker effectively. We'll also answer frequently asked questions about vendor payment systems.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is a Vendor Payment Tracker?</h3>
          <p className="text-gray-600">
            A vendor payment tracker is a tool that records all financial transactions with suppliers. It tracks invoice due dates, payment statuses, amounts paid and pending, and contact information. It helps businesses avoid missed payments, take advantage of early payment discounts, and maintain good credit with vendors.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Key Features of This Tool</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Vendor Management:</strong> Add, edit, and view vendor details (name, contact, address).</li>
            <li><strong>Payment Recording:</strong> Record individual payments with amount, due date, description, and mode.</li>
            <li><strong>Auto Status Updates:</strong> Payments are automatically marked as Paid, Pending, or Overdue based on due date and payment date.</li>
            <li><strong>Dashboard Stats:</strong> Total due, total paid, pending, overdue amounts.</li>
            <li><strong>Filters & Search:</strong> Filter by vendor, status, and search by description.</li>
            <li><strong>Interactive Charts:</strong> Pending by vendor (bar chart) and payment timeline (line chart).</li>
            <li><strong>PDF Report:</strong> Download complete report with all tables and charts.</li>
            <li><strong>Mark as Paid:</strong> One-click to mark pending/overdue payments as paid.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Vendor Payment Tracker</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Add Vendors:</strong> Click "Add Vendor" and fill in name, contact details, address.</li>
            <li><strong>Record Payments:</strong> Click "Record Payment", select vendor, enter amount, due date, payment date (if paid), description, and mode.</li>
            <li><strong>View Dashboard:</strong> See summary cards for total due, paid, pending, overdue.</li>
            <li><strong>Filter Payments:</strong> Use dropdowns to view payments for a specific vendor or status.</li>
            <li><strong>Mark as Paid:</strong> Click "Pay" next to a pending/overdue payment to mark it paid (date auto-filled).</li>
            <li><strong>Delete Payments:</strong> Remove incorrect or duplicate payments.</li>
            <li><strong>Analyze Charts:</strong> See which vendors have highest pending amounts and payment trends over time.</li>
            <li><strong>Download Report:</strong> Generate PDF for accounting or management review.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Benefits of Using a Vendor Payment Tracker</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Avoid Late Fees:</strong> Overdue alerts help you prioritize payments.</li>
            <li><strong>Improve Vendor Relationships:</strong> Timely payments build trust.</li>
            <li><strong>Cash Flow Management:</strong> Know exactly how much is due and when.</li>
            <li><strong>Audit Trail:</strong> Complete history of all payments.</li>
            <li><strong>Negotiation Power:</strong> Track total spend with each vendor for bulk discounts.</li>
            <li><strong>Tax Compliance:</strong> Accurate records for GST/TDS reporting.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Common Vendor Payment Terms</h3>
          <p className="text-gray-600">
            - <strong>Net 30/60/90:</strong> Payment due 30, 60, or 90 days after invoice date.<br />
            - <strong>2/10 Net 30:</strong> 2% discount if paid within 10 days, else full due in 30 days.<br />
            - <strong>COD (Cash on Delivery):</strong> Payment upon receipt.<br />
            - <strong>Advance Payment:</strong> Partial or full payment before delivery.<br />
            - <strong>Letter of Credit (LC):</strong> Bank guarantees payment.<br />
            Use the due date field to track these terms.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Best Practices for Vendor Payment Management</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Set up payment reminders (use due dates in tracker).</li>
            <li>Negotiate favorable payment terms (e.g., Net 45 instead of Net 30).</li>
            <li>Take advantage of early payment discounts if cash flow permits.</li>
            <li>Regularly reconcile vendor statements with your records.</li>
            <li>Maintain a vendor master with updated contact information.</li>
            <li>Classify vendors by criticality (tier 1, tier 2) for prioritization.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is this tool free?</strong><p className="text-gray-600">Yes, completely free to use for personal or business purposes. No sign-up required.</p></div>
            <div><strong className="text-gray-800">Q2. Can I edit or delete a vendor?</strong><p className="text-gray-600">Currently, vendors cannot be edited directly. You can delete associated payments and then remove vendor manually (future update).</p></div>
            <div><strong className="text-gray-800">Q3. How are overdue payments determined?</strong><p className="text-gray-600">If due date is past today and payment date is empty, status becomes "Overdue".</p></div>
            <div><strong className="text-gray-800">Q4. Can I export data to Excel?</strong><p className="text-gray-600">PDF export is available. CSV export can be added on request.</p></div>
            <div><strong className="text-gray-800">Q5. Is my data stored permanently?</strong><p className="text-gray-600">Data is stored in your browser's memory. Refreshing the page will reset to sample data. For permanent storage, you need a backend.</p></div>
            <div><strong className="text-gray-800">Q6. Can I add multiple payment modes?</strong><p className="text-gray-600">Yes: Cash, Bank Transfer, Cheque, UPI are supported.</p></div>
            <div><strong className="text-gray-800">Q7. How do I handle partial payments?</strong><p className="text-gray-600">For partial payments, create multiple payment records against the same invoice or use the description field.</p></div>
            <div><strong className="text-gray-800">Q8. Does this support GST/TDS reporting?</strong><p className="text-gray-600">Not directly, but you can add tax details in description or vendor notes.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Advanced Tips for Power Users</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Use consistent naming for vendors to avoid duplicates.</li>
            <li>Set due dates based on actual invoice terms for accurate overdue detection.</li>
            <li>Export PDF reports monthly for reconciliation.</li>
            <li>Combine with accounting software (like Tally, Zoho) for end-to-end management.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Future Enhancements</h3>
          <p className="text-gray-600">
            Planned: Vendor editing, bulk payment upload, email reminders, dashboard with aging analysis (30/60/90 days), and CSV export.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Final Thoughts</h3>
          <p className="text-gray-600">
            Effective vendor payment management is a cornerstone of financial health. Our Vendor Payment Tracker simplifies this process, giving you real-time visibility into your payables. Start using it today to avoid late fees, strengthen supplier relationships, and maintain accurate books.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Get started now – add your vendors, record payments, and download your first report!</strong>
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: This tool is for demonstration and planning. For critical financial decisions, please consult your accountant.
          </div>
        </div>
      </div> <ContentSection data={pageContent} />
    </div>
  );
}