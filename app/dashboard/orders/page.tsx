'use client';
import { useEffect, useState } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [products, setProducts] = useState([]);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    const data = await res.json();
    setOrders(data);
  };
  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => { fetchOrders(); fetchProducts(); }, []);

  const handleAddItem = () => setItems([...items, { productId: '', quantity: 1 }]);
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const orderData = {
      customerName,
      customerEmail,
      customerPhone,
      items: items.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })),
      discount: 0,
      tax: 0,
      paymentMethod: 'cash',
      notes: '',
    };
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    setShowNew(false);
    setCustomerName(''); setCustomerEmail(''); setCustomerPhone('');
    setItems([{ productId: '', quantity: 1 }]);
    fetchOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <button onClick={() => setShowNew(!showNew)} className="bg-green-600 text-white px-4 py-2 rounded mb-4">
        {showNew ? 'Cancel' : 'New Order (POS)'}
      </button>
      {showNew && (
        <form onSubmit={handleSubmitOrder} className="border p-4 mb-6 rounded">
          <h2 className="font-bold mb-2">Create Order</h2>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="border p-2 rounded" required />
            <input placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="border p-2 rounded" />
            <input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="border p-2 rounded" />
          </div>
          <h3 className="font-semibold mt-2">Items</h3>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mt-1">
              <select value={item.productId} onChange={(e) => handleItemChange(idx, 'productId', e.target.value)} className="border p-2 rounded flex-1">
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
              </select>
              <input type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="border p-2 rounded w-20" min="1" />
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="text-blue-600 mt-2">+ Add item</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded ml-4">Create Order</button>
        </form>
      )}
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="border p-4 rounded">
            <div className="flex justify-between">
              <strong>{o.orderNumber}</strong>
              <span className={`px-2 py-1 rounded text-sm ${o.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</span>
            </div>
            <div>Customer: {o.customerName} | Total: ₹{o.grandTotal}</div>
            <div className="text-sm text-gray-500">{o.items.length} items</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
