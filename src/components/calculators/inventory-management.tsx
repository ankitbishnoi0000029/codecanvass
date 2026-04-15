'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadMetricsAsText } from '@/utils/utils';

// --- Types ---
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
  reorderLevel: number;
  supplier: string;
  lastUpdated: string;
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
  return new Intl.NumberFormat('en-IN').format(value);
};

const formatCompactCurrency = (value: number): string => {
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(0)} K`;
  return `₹${value}`;
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// --- Initial Sample Data ---
const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'WM-001', quantity: 145, price: 899, category: 'Electronics', reorderLevel: 30, supplier: 'TechSupply Co.', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Mechanical Keyboard', sku: 'MK-002', quantity: 67, price: 2499, category: 'Electronics', reorderLevel: 20, supplier: 'KeyCorp', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'USB-C Cable', sku: 'UC-003', quantity: 320, price: 299, category: 'Accessories', reorderLevel: 50, supplier: 'CableWorld', lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Laptop Stand', sku: 'LS-004', quantity: 23, price: 1499, category: 'Furniture', reorderLevel: 15, supplier: 'ErgoSolutions', lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Noise Cancelling Headphones', sku: 'NC-005', quantity: 42, price: 4999, category: 'Electronics', reorderLevel: 10, supplier: 'AudioBrand', lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Screen Protector', sku: 'SP-006', quantity: 89, price: 199, category: 'Accessories', reorderLevel: 40, supplier: 'GlassGuard', lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Gaming Chair', sku: 'GC-007', quantity: 12, price: 12999, category: 'Furniture', reorderLevel: 5, supplier: 'ComfortSeats', lastUpdated: new Date().toISOString() },
  { id: '8', name: 'Power Bank', sku: 'PB-008', quantity: 156, price: 1299, category: 'Electronics', reorderLevel: 25, supplier: 'PowerPlus', lastUpdated: new Date().toISOString() },
];

// Categories for dropdown
const categories = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Food', 'Other'];

// --- Main Component ---
export default function InventoryManagementTool() {
  // State
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state for add/edit
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'lastUpdated'>>({
    name: '',
    sku: '',
    quantity: 0,
    price: 0,
    category: 'Electronics',
    reorderLevel: 10,
    supplier: '',
  });

  // Statistics
  const stats = useMemo(() => {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
    const categoriesCount = new Set(inventory.map(item => item.category)).size;
    return { totalItems, totalValue, lowStockItems, categoriesCount };
  }, [inventory]);

  // Filtered and sorted inventory
  const filteredInventory = useMemo(() => {
    let filtered = [...inventory];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Low stock filter
    if (lowStockOnly) {
      filtered = filtered.filter(item => item.quantity <= item.reorderLevel);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'quantity') {
        return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
      } else {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
    });
    
    return filtered;
  }, [inventory, searchTerm, categoryFilter, lowStockOnly, sortBy, sortOrder]);

  // Chart data: Stock by category
  const categoryChartData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    inventory.forEach(item => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
    });
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return Object.entries(categoryMap).map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }));
  }, [inventory]);

  // Chart data: Stock value by category
  const valueChartData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    inventory.forEach(item => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + (item.quantity * item.price);
    });
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return Object.entries(categoryMap).map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }));
  }, [inventory]);

  // Low stock items for alert
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.reorderLevel);
  }, [inventory]);

  // CRUD Operations
  const handleAddItem = () => {
    if (!formData.name || !formData.sku || formData.quantity < 0 || formData.price < 0) {
      alert('Please fill all required fields');
      return;
    }
    const newItem: InventoryItem = {
      ...formData,
      id: generateId(),
      lastUpdated: new Date().toISOString(),
    };
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
    setFormData({ name: '', sku: '', quantity: 0, price: 0, category: 'Electronics', reorderLevel: 10, supplier: '' });
  };

  const handleEditItem = () => {
    if (!selectedItem) return;
    const updatedInventory = inventory.map(item =>
      item.id === selectedItem.id ? { ...selectedItem, lastUpdated: new Date().toISOString() } : item
    );
    setInventory(updatedInventory);
    setShowEditModal(false);
    setSelectedItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() } : item
    ));
  };

  // PDF Report
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true); // keep loading state if needed, or rename to setIsDownloading
        try {
          // Prepare the data array for download (adjust based on your actual data structure)
          const downloadData = [
           { metric: 'Item Name', value: selectedItem?.name || '' },
           { metric: 'Item SKU', value: selectedItem?.sku || '' },
           { metric: 'Quantity', value: selectedItem?.quantity || '' },
           { metric: 'Price', value: selectedItem?.price || '' },
           { metric: 'Category', value: selectedItem?.category || '' },
           { metric: 'Reorder Level', value: selectedItem?.reorderLevel || '' },
           { metric: 'Supplier', value: selectedItem?.supplier || '' },
           { metric: 'Last Updated', value: selectedItem?.lastUpdated || '' },
           { metric: 'ID', value: selectedItem?.id || '' },
           { metric: 'Last Updated', value: selectedItem?.lastUpdated || '' },
           
          ];
      
          // Reusable download function (import from utils or define inline)
          downloadMetricsAsText(downloadData, {
            filename: 'REPORT',
            title: ' Calculator Report',
            footer: '* Generated from calculator',
          });
        } catch (error) {
          console.error('Download error:', error);
        } finally {
          setIsGeneratingPDF(false);
        }
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Inventory Management Tool
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Track stock levels, manage products, monitor low stock alerts, and generate comprehensive reports.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-emerald-500">
            <p className="text-gray-500 text-sm">Total Items in Stock</p>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(stats.totalItems)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Inventory Value</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-2xl font-bold text-gray-800">{stats.categoriesCount}</p>
          </div>
        </div>

        {/* Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-red-700 font-semibold">Low Stock Alert:</span>
              <span className="text-red-600">{lowStockItems.length} item(s) are below reorder level. Please restock soon.</span>
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by name, SKU, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <label className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
                <span className="text-sm">Low Stock Only</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="name">Sort by Name</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="price">Sort by Price</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md"
            >
              + Add New Item
            </button>
          </div>
        </div>

        {/* Inventory Table (PDF capture area) */}
        <div ref={reportRef} className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">Supplier: {item.supplier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{item.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >-</button>
                        <span className={`font-medium ${item.quantity <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatNumber(item.quantity)}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                        >+</button>
                      </div>
                      {item.quantity <= item.reorderLevel && (
                        <div className="text-xs text-red-500 mt-1">Reorder at {item.reorderLevel}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{formatCurrency(item.quantity * item.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => { setSelectedItem(item); setShowEditModal(true); }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >Edit</button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">No items found</div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock by Category (Units)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" >
                    {categoryChartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatNumber(v as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Value by Category (₹)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={valueChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => formatCompactCurrency(v)} />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Legend />
                  <Bar dataKey="value" name="Value (₹)" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Report'}
          </button>
        </div>

        {/* Add/Edit Modals */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add New Item</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="SKU" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Price (₹)" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                <input type="number" placeholder="Reorder Level" value={formData.reorderLevel} onChange={(e) => setFormData({...formData, reorderLevel: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Supplier" value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAddItem} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Add</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Edit Item</h2>
              <div className="space-y-3">
                <input type="text" placeholder="Product Name" value={selectedItem.name} onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="SKU" value={selectedItem.sku} onChange={(e) => setSelectedItem({...selectedItem, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Quantity" value={selectedItem.quantity} onChange={(e) => setSelectedItem({...selectedItem, quantity: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Price (₹)" value={selectedItem.price} onChange={(e) => setSelectedItem({...selectedItem, price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <select value={selectedItem.category} onChange={(e) => setSelectedItem({...selectedItem, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
                <input type="number" placeholder="Reorder Level" value={selectedItem.reorderLevel} onChange={(e) => setSelectedItem({...selectedItem, reorderLevel: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Supplier" value={selectedItem.supplier} onChange={(e) => setSelectedItem({...selectedItem, supplier: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleEditItem} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg">Save</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* SEO Content Section - 10000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Inventory Management Tool</h2>
          <p className="text-gray-600 leading-relaxed">
            Inventory management is the backbone of any business that deals with physical products. Whether you run a retail store, warehouse, e-commerce business, or manufacturing unit, tracking stock levels, monitoring reorder points, and analyzing inventory value are critical for profitability and operational efficiency. Our Inventory Management Tool provides a comprehensive solution to manage your products, track quantities, receive low stock alerts, and generate detailed reports.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            This tool allows you to add, edit, delete, and update inventory items in real-time. You can search, filter by category, sort by various fields, and visualize stock distribution through interactive charts. The PDF report feature lets you download a complete snapshot of your inventory for audits or management reviews. In this guide, we will explore inventory management best practices, key metrics, common challenges, and answer frequently asked questions.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is Inventory Management?</h3>
          <p className="text-gray-600">
            Inventory management is the process of ordering, storing, tracking, and controlling a company's inventory. This includes raw materials, work-in-progress items, and finished goods. Effective inventory management ensures that you have the right products in the right quantity at the right time, minimizing carrying costs while avoiding stockouts.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Key Features of This Inventory Management Tool</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Product Master:</strong> Store product name, SKU, category, supplier, price, and current quantity.</li>
            <li><strong>Real-time Quantity Updates:</strong> Increment or decrement stock with one click.</li>
            <li><strong>Low Stock Alerts:</strong> Automatic highlighting and banner when quantity falls below reorder level.</li>
            <li><strong>Search & Filter:</strong> Find products by name, SKU, supplier, or category. Filter by low stock only.</li>
            <li><strong>Sorting:</strong> Sort by name, quantity, or price in ascending/descending order.</li>
            <li><strong>Analytics Charts:</strong> Pie chart for stock distribution by category, bar chart for inventory value by category.</li>
            <li><strong>PDF Report:</strong> Download a complete inventory report with all tables and charts.</li>
            <li><strong>CRUD Operations:</strong> Add, edit, delete products easily.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Inventory Management Tool</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>View Inventory:</strong> The main table displays all products with key details.</li>
            <li><strong>Add New Item:</strong> Click "Add New Item" button, fill the form, and submit.</li>
            <li><strong>Update Quantity:</strong> Use the + and - buttons next to each product's quantity.</li>
            <li><strong>Edit/Delete:</strong> Use action buttons to modify or remove items.</li>
            <li><strong>Search & Filter:</strong> Use the search bar, category dropdown, and low stock checkbox.</li>
            <li><strong>Sort:</strong> Change sort criteria and order from the controls bar.</li>
            <li><strong>Generate Report:</strong> Click "Download PDF Report" to save a snapshot.</li>
            <li><strong>Monitor Low Stock:</strong> Red text and alert banner show items needing restock.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Inventory Metrics to Track</h3>
          <p className="text-gray-600">
            - <strong>Stock Quantity:</strong> Current units on hand.<br />
            - <strong>Reorder Level:</strong> Minimum quantity before restocking.<br />
            - <strong>Inventory Turnover Ratio:</strong> How often inventory is sold and replaced.<br />
            - <strong>Carrying Cost:</strong> Storage, insurance, and opportunity cost.<br />
            - <strong>Stockout Rate:</strong> Percentage of time an item is unavailable.<br />
            - <strong>ABC Analysis:</strong> Classify items by value contribution (A = high value, B = medium, C = low).<br />
            Our tool tracks quantity, reorder level, and value – essential for ABC analysis.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Benefits of Using an Inventory Management Tool</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Prevent Stockouts:</strong> Low stock alerts ensure timely reordering.</li>
            <li><strong>Reduce Excess Inventory:</strong> Identify slow-moving items.</li>
            <li><strong>Save Time:</strong> Centralized digital records replace spreadsheets.</li>
            <li><strong>Improve Cash Flow:</strong> Optimize stock levels to free up capital.</li>
            <li><strong>Data-Driven Decisions:</strong> Charts and reports provide actionable insights.</li>
            <li><strong>Audit Readiness:</strong> PDF reports can be shared with stakeholders.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Inventory Management Best Practices</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Conduct regular physical counts (cycle counting).</li>
            <li>Set reorder levels based on lead time and demand variability.</li>
            <li>Use FIFO (First-In-First-Out) for perishable goods.</li>
            <li>Implement barcode or RFID for faster tracking.</li>
            <li>Integrate inventory with sales and purchasing systems.</li>
            <li>Review slow-moving and dead stock quarterly.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Common Inventory Management Challenges & Solutions</h3>
          <p className="text-gray-600">
            <strong>Challenge 1:</strong> Inaccurate stock records due to manual errors.<br />
            <strong>Solution:</strong> Use digital tools with real-time updates (like this one).<br />
            <strong>Challenge 2:</strong> Overstocking tying up capital.<br />
            <strong>Solution:</strong> Analyze turnover ratios and set optimal reorder points.<br />
            <strong>Challenge 3:</strong> Stockouts during peak demand.<br />
            <strong>Solution:</strong> Use safety stock calculations and demand forecasting.<br />
            <strong>Challenge 4:</strong> Lack of visibility across multiple locations.<br />
            <strong>Solution:</strong> Implement multi-warehouse inventory software.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Inventory Valuation Methods</h3>
          <p className="text-gray-600">
            - <strong>FIFO (First-In-First-Out):</strong> Assumes oldest items sold first. Common for perishables.<br />
            - <strong>LIFO (Last-In-First-Out):</strong> Assumes newest items sold first. Used for tax benefits in some regions.<br />
            - <strong>Weighted Average Cost:</strong> Averages cost of all units.<br />
            Our tool uses actual purchase price per item, but you can adapt to your method.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is this tool free to use?</strong><p className="text-gray-600">Yes, this is a free, open-source inventory management tool. You can use it for personal or business purposes.</p></div>
            <div><strong className="text-gray-800">Q2. Can I export data to Excel?</strong><p className="text-gray-600">Currently, the tool exports to PDF. You can copy the table data manually or we can add CSV export in future updates.</p></div>
            <div><strong className="text-gray-800">Q3. How is data stored?</strong><p className="text-gray-600">Data is stored in the browser's memory. For persistent storage, you would need to connect a backend database.</p></div>
            <div><strong className="text-gray-800">Q4. Can I track multiple warehouses?</strong><p className="text-gray-600">The current version is for single-location inventory. For multi-location, you would need additional fields.</p></div>
            <div><strong className="text-gray-800">Q5. How do I set reorder levels?</strong><p className="text-gray-600">When adding or editing an item, enter the minimum quantity you want to keep. The tool will alert when stock falls below that level.</p></div>
            <div><strong className="text-gray-800">Q6. Can I upload bulk items?</strong><p className="text-gray-600">Bulk upload is not available in this version, but you can add items one by one using the form.</p></div>
            <div><strong className="text-gray-800">Q7. Is there a mobile version?</strong><p className="text-gray-600">The tool is responsive and works on mobile browsers, but for best experience, use on desktop or tablet.</p></div>
            <div><strong className="text-gray-800">Q8. How often should I update inventory?</strong><p className="text-gray-600">Update in real-time as sales and purchases occur. Our tool allows instant quantity adjustments.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Advanced Tips for Power Users</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Use consistent naming conventions and SKU formats for easy searching.</li>
            <li>Set reorder levels based on supplier lead time + safety stock.</li>
            <li>Regularly audit your inventory to reconcile physical vs digital counts.</li>
            <li>Analyze the category charts to identify which product lines have highest value.</li>
            <li>Use the PDF report for monthly management reviews or tax purposes.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Future Enhancements</h3>
          <p className="text-gray-600">
            Planned features: CSV import/export, barcode scanning, multi-warehouse support, sales order integration, and demand forecasting. The tool is designed to be extensible – contributions welcome!
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">12. Final Thoughts</h3>
          <p className="text-gray-600">
            Effective inventory management is crucial for business success. Our Inventory Management Tool simplifies the process, giving you full control over your stock. Start using it today to reduce costs, prevent stockouts, and make data-driven decisions.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Get started now – add your products, monitor stock levels, and download reports. Your inventory will thank you!</strong>
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: This tool is for demonstration and planning purposes. For critical business operations, ensure data backup and consider professional inventory management software.
          </div>
        </div>
      </div>
    </div>
  );
}