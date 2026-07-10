'use client';
import { useEffect, useState } from 'react';

export default function AccountingPage() {
  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState([]);

  const fetchData = async () => {
    const inv = await fetch('/api/invoices').then(r => r.json());
    setInvoices(inv);
    // Ledger: we can fetch from ledger API (we'll create a simple one via orders)
    // For now, we show invoices
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Accounting</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">Total Invoices: {invoices.length}</div>
        <div className="bg-white p-4 rounded shadow">Total Revenue: ₹{invoices.reduce((sum, inv) => sum + (inv.order?.grandTotal || 0), 0)}</div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Invoices</h2>
      <ul className="space-y-2">
        {invoices.map((inv) => (
          <li key={inv.id} className="border p-4 rounded">
            <div><strong>{inv.invoiceNumber}</strong> - Order: {inv.order?.orderNumber}</div>
            <div>Amount: ₹{inv.order?.grandTotal} | Status: {inv.status}</div>
            <div className="text-sm text-gray-500">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
