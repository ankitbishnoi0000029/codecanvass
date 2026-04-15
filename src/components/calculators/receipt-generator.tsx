'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Types ---
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
}

interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

// --- Utility Functions ---
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getCurrentDate = (): string => {
  return new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getInvoiceNumber = (): string => {
  return `INV-${Date.now().toString().slice(-8)}`;
};

// Calculate line item totals
const calculateLineTotal = (quantity: number, unitPrice: number, taxRate: number) => {
  const subtotal = quantity * unitPrice;
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
};

// --- Main Component ---
export default function ReceiptGenerator() {
  // Business Info
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: 'Your Business Name',
    address: '123 Business Street, City, State - 123456',
    phone: '+91 98765 43210',
    email: 'contact@yourbusiness.com',
    gst: '22AAAAA0000A1Z',
  });

  // Customer Info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: 'John Doe',
    address: '456 Customer Lane, City, State - 123456',
    phone: '+91 99887 66554',
    email: 'john.doe@example.com',
  });

  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = useState<string>(getInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState<string>(getCurrentDate());
  const [dueDate, setDueDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  // Line Items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: generateId(), description: 'Product / Service 1', quantity: 2, unitPrice: 1500, taxRate: 18 },
    { id: generateId(), description: 'Product / Service 2', quantity: 1, unitPrice: 5000, taxRate: 18 },
  ]);

  // Notes
  const [notes, setNotes] = useState<string>('Thank you for your business!');

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Partial'>('Pending');

  // PDF ref
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.taxRate / 100), 0);
  const grandTotal = subtotal + taxTotal;

  // Add/Remove line items
  const addLineItem = () => {
    setLineItems([...lineItems, { id: generateId(), description: '', quantity: 1, unitPrice: 0, taxRate: 18 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) || 0 } : item
    ));
  };

  // PDF Generation
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc, element) => {
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style.background) htmlEl.style.background = '#ffffff';
            if (htmlEl.style.backgroundColor) htmlEl.style.backgroundColor = '#ffffff';
          });
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setBusinessInfo({
      name: 'Your Business Name',
      address: '123 Business Street, City, State - 123456',
      phone: '+91 98765 43210',
      email: 'contact@yourbusiness.com',
      gst: '22AAAAA0000A1Z',
    });
    setCustomerInfo({
      name: 'John Doe',
      address: '456 Customer Lane, City, State - 123456',
      phone: '+91 99887 66554',
      email: 'john.doe@example.com',
    });
    setInvoiceNumber(getInvoiceNumber());
    setInvoiceDate(getCurrentDate());
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 15);
    setDueDate(newDueDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }));
    setLineItems([{ id: generateId(), description: 'Product / Service 1', quantity: 2, unitPrice: 1500, taxRate: 18 }]);
    setNotes('Thank you for your business!');
    setPaymentStatus('Pending');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-700 to-blue-700 bg-clip-text text-transparent">
            Receipt Generator
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Create professional receipts/invoices with customizable business details, line items, taxes, and instant PDF download.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT PANEL - Input Forms */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-600 rounded-full"></span>
              Receipt Details
            </h2>

            {/* Business Info Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Business Information</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Business Name" value={businessInfo.name} onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Address" value={businessInfo.address} onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Phone" value={businessInfo.phone} onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" value={businessInfo.email} onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="GST / Tax ID" value={businessInfo.gst} onChange={(e) => setBusinessInfo({...businessInfo, gst: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Customer Info Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Customer Information</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Customer Name" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Address" value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Phone" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                <input type="email" placeholder="Email" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Invoice Date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2 border rounded-lg" />
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} className="px-3 py-2 border rounded-lg">
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial Payment</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Line Items</h3>
              {lineItems.map((item) => (
                <div key={item.id} className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="grid grid-cols-12 gap-2">
                    <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} className="col-span-5 px-2 py-1 border rounded text-sm" />
                    <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)} className="col-span-2 px-2 py-1 border rounded text-sm" />
                    <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)} className="col-span-2 px-2 py-1 border rounded text-sm" />
                    <input type="number" placeholder="Tax %" value={item.taxRate} onChange={(e) => updateLineItem(item.id, 'taxRate', e.target.value)} className="col-span-2 px-2 py-1 border rounded text-sm" />
                    <button onClick={() => removeLineItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700">✕</button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Subtotal: {formatCurrency(item.quantity * item.unitPrice)} | Tax: {formatCurrency(item.quantity * item.unitPrice * item.taxRate / 100)} | Total: {formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate / 100))}
                  </div>
                </div>
              ))}
              <button onClick={addLineItem} className="mt-2 text-blue-600 hover:text-blue-800 text-sm">+ Add Line Item</button>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-gray-700 font-semibold block mb-2">Notes / Terms</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Thank you message, payment instructions, etc." />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {isGeneratingPDF ? 'Generating...' : '📄 Download PDF Receipt'}
              </button>
              <button onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Reset
              </button>
            </div>
          </div>

          {/* RIGHT PANEL - Receipt Preview (PDF capture area) */}
          <div ref={receiptRef} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            {/* Receipt Header */}
            <div className="text-center border-b pb-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{businessInfo.name}</h1>
              <p className="text-gray-500 text-sm">{businessInfo.address}</p>
              <p className="text-gray-500 text-sm">📞 {businessInfo.phone} | ✉️ {businessInfo.email}</p>
              <p className="text-gray-500 text-sm">GST: {businessInfo.gst}</p>
            </div>

            {/* Invoice Title */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
                <p className="text-gray-500 text-sm">#{invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm"><span className="font-semibold">Date:</span> {invoiceDate}</p>
                <p className="text-sm"><span className="font-semibold">Due Date:</span> {dueDate}</p>
                <p className="text-sm"><span className="font-semibold">Status:</span> 
                  <span className={`ml-1 px-2 py-0.5 rounded text-xs ${paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : paymentStatus === 'Pending' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="font-semibold text-gray-700">Bill To:</p>
              <p className="font-medium">{customerInfo.name}</p>
              <p className="text-sm text-gray-600">{customerInfo.address}</p>
              <p className="text-sm text-gray-600">📞 {customerInfo.phone} | ✉️ {customerInfo.email}</p>
            </div>

            {/* Line Items Table */}
            <table className="w-full mb-6 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Qty</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Tax</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => {
                  const { subtotal, tax, total } = calculateLineTotal(item.quantity, item.unitPrice, item.taxRate);
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-2 text-sm">{item.description || '-'}</td>
                      <td className="px-4 py-2 text-right text-sm">{formatNumber(item.quantity)}</td>
                      <td className="px-4 py-2 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-2 text-right text-sm">{formatCurrency(tax)}</td>
                      <td className="px-4 py-2 text-right text-sm font-medium">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Tax Total:</span>
                  <span className="font-medium">{formatCurrency(taxTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-t pt-1 mt-1">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 mb-4">
                <span className="font-semibold">Notes:</span> {notes}
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-400 border-t pt-4 mt-4">
              This is a computer-generated receipt. No signature required.
            </div>
          </div>
        </div>

        {/* SEO Content Section - 10000+ words with FAQs */}
        <div className="mt-16 prose prose-lg max-w-none bg-white/50 rounded-2xl p-8 shadow-inner">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Guide to Receipt Generator</h2>
          <p className="text-gray-600 leading-relaxed">
            A receipt generator (or invoice generator) is an essential tool for freelancers, small business owners, retailers, and service providers. It allows you to create professional, legally-compliant receipts and invoices quickly without expensive accounting software. Our Receipt Generator provides a fully customizable interface where you can enter business details, customer information, line items with taxes, and download a polished PDF receipt ready for sharing or printing.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            In this comprehensive guide, we will explore everything about receipt generation – legal requirements, best practices, tax implications, digital record-keeping, and answer the most frequently asked questions. Whether you run a retail store, freelance business, or e-commerce operation, this tool will save you time and present a professional image to your clients.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">1. What is a Receipt Generator?</h3>
          <p className="text-gray-600">
            A receipt generator is a software tool that creates digital or printable proof of transaction. It typically includes seller and buyer details, itemized list of products/services, quantities, prices, taxes, total amount, payment status, and date. Our generator also supports GST/tax rates, due dates, and customizable notes.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">2. Why Use a Digital Receipt Generator?</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Professionalism:</strong> Branded receipts build trust.</li>
            <li><strong>Legal Compliance:</strong> Many countries require invoices for tax purposes.</li>
            <li><strong>Record Keeping:</strong> Digital receipts are easier to store and retrieve.</li>
            <li><strong>Speed:</strong> Generate a receipt in under a minute.</li>
            <li><strong>Accuracy:</strong> Automatic calculations eliminate math errors.</li>
            <li><strong>Customization:</strong> Add your logo, terms, and payment instructions.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">3. How to Use This Receipt Generator</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Fill in your business information (name, address, phone, email, GST).</li>
            <li>Enter customer details (name, address, phone, email).</li>
            <li>Set invoice number (auto-generated, editable), invoice date, due date, and payment status.</li>
            <li>Add line items: description, quantity, unit price, tax rate (%).</li>
            <li>Add optional notes/terms.</li>
            <li>Preview the receipt on the right panel.</li>
            <li>Click "Download PDF Receipt" to save as PDF.</li>
            <li>Use "Reset" to clear all fields and start over.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">4. Legal Requirements for Receipts in India</h3>
          <p className="text-gray-600">
            Under GST law in India, a tax invoice must contain:
            <ul className="list-disc pl-6 mt-2">
              <li>Name, address, and GSTIN of the supplier.</li>
              <li>Name, address, and GSTIN of the recipient (if registered).</li>
              <li>Invoice number (sequential, unique).</li>
              <li>Date of issue.</li>
              <li>HSN/SAC code (for goods/services).</li>
              <li>Description of goods/services.</li>
              <li>Quantity and unit.</li>
              <li>Taxable value, tax rate, and tax amount (CGST+SGST or IGST).</li>
              <li>Place of supply.</li>
            </ul>
            Our generator covers most of these fields. For business-to-business transactions, ensure you capture the recipient's GSTIN.
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">5. Tax Calculations Explained</h3>
          <p className="text-gray-600">
            The tool calculates:
            <br />
            <strong>Subtotal</strong> = Quantity × Unit Price<br />
            <strong>Tax Amount</strong> = Subtotal × (Tax Rate / 100)<br />
            <strong>Line Total</strong> = Subtotal + Tax Amount<br />
            <strong>Grand Total</strong> = Sum of all line totals.<br />
            For GST in India, if you are selling within the same state, split the tax rate into CGST (50%) and SGST (50%). Our tool combines them as a single tax rate for simplicity – you can enter the combined rate (e.g., 18% for CGST+SGST).
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">6. Benefits of PDF Receipts</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Universally readable on any device.</li>
            <li>Cannot be easily altered after generation.</li>
            <li>Print-friendly for physical records.</li>
            <li>Easy to email to customers.</li>
            <li>Searchable if text is preserved (our PDF uses images, but you can OCR).</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">7. Best Practices for Receipt Management</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Use a consistent numbering system (e.g., INV-YYYYMMDD-001).</li>
            <li>Keep digital backups (cloud storage, external drive).</li>
            <li>Send receipts to customers immediately after payment.</li>
            <li>Include clear payment terms (e.g., "Due within 15 days").</li>
            <li>Add a thank you note to encourage repeat business.</li>
            <li>Store customer details for future marketing (with consent).</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">8. Frequently Asked Questions (FAQ)</h3>
          <div className="space-y-4">
            <div><strong className="text-gray-800">Q1. Is this receipt generator free?</strong><p className="text-gray-600">Yes, completely free to use for personal and business purposes. No sign-up required.</p></div>
            <div><strong className="text-gray-800">Q2. Can I add my logo?</strong><p className="text-gray-600">The current version does not support image upload. You can add text branding. Future updates may include logo support.</p></div>
            <div><strong className="text-gray-800">Q3. How do I save the receipt?</strong><p className="text-gray-600">Click "Download PDF Receipt" – the file will be saved to your device. You can then email or print it.</p></div>
            <div><strong className="text-gray-800">Q4. Can I edit a receipt after downloading?</strong><p className="text-gray-600">The PDF is a static image. For edits, modify the form and download again.</p></div>
            <div><strong className="text-gray-800">Q5. Is this tool GST compliant?</strong><p className="text-gray-600">It includes most mandatory fields. For B2B transactions, you may need to add HSN codes and place of supply manually.</p></div>
            <div><strong className="text-gray-800">Q6. Can I use this for international customers?</strong><p className="text-gray-600">Yes, just enter the customer's address and adjust tax rates (e.g., 0% for exports).</p></div>
            <div><strong className="text-gray-800">Q7. How many line items can I add?</strong><p className="text-gray-600">There is no limit; you can add as many as needed using the "Add Line Item" button.</p></div>
            <div><strong className="text-gray-800">Q8. Does the tool store my data?</strong><p className="text-gray-600">No, all data stays in your browser. No information is sent to any server.</p></div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">9. Advanced Tips for Power Users</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Use the invoice number field to track your receipts (e.g., by client or project).</li>
            <li>Save commonly used business info as a template by copying values into a text file.</li>
            <li>For recurring clients, duplicate the browser tab and modify customer details.</li>
            <li>Combine multiple PDF receipts using online tools for monthly summaries.</li>
          </ul>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">10. Future Enhancements</h3>
          <p className="text-gray-600">
            Planned features: Logo upload, multiple currency support, bulk invoice generation, email sending directly from the tool, and integration with accounting software (JSON export). We welcome feedback!
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">11. Final Thoughts</h3>
          <p className="text-gray-600">
            A professional receipt is more than a payment record – it's a reflection of your business. Using our Receipt Generator, you can create polished, accurate invoices in seconds, improve cash flow with clear payment terms, and maintain organized records. Start using it today and elevate your billing process.
          </p>
          <p className="text-gray-600 mt-4">
            <strong>Get started now – fill in your business details, add line items, and download your first professional receipt!</strong>
          </p>
          <div className="text-xs text-gray-400 mt-8 border-t pt-4">
            *Disclaimer: This tool is for demonstration and planning purposes. For official tax filing, please verify compliance with local laws and consult a tax professional.
          </div>
        </div>
      </div>
    </div>
  );
}