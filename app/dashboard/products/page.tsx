'use client';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = async () => {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/products/${editingId}` : '/api/products';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: parseFloat(price), stock: parseInt(stock) || 0, description }),
    });
    setName(''); setPrice(''); setStock(''); setDescription(''); setEditingId(null);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this product?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded" />
        <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" />
        <input placeholder="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="border p-2 rounded" />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button onClick={() => { setEditingId(null); setName(''); setPrice(''); setStock(''); setDescription(''); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
      </form>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="border p-4 rounded flex justify-between items-center">
            <div><strong>{p.name}</strong> - ₹{p.price} (Stock: {p.stock})<br/><span className="text-sm text-gray-500">{p.description}</span></div>
            <div>
              <button onClick={() => { setEditingId(p.id); setName(p.name); setPrice(p.price); setStock(p.stock); setDescription(p.description || ''); }} className="text-blue-600 mr-2">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
