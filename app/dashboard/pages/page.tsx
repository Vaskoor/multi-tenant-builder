'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function PagesPage() {
  const { data: session } = useSession();
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({ slug: '', title: '', isHome: false });

  const fetchPages = async () => {
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data);
  };

  useEffect(() => { fetchPages(); }, []);

  const createPage = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPage),
    });
    if (res.ok) {
      setNewPage({ slug: '', title: '', isHome: false });
      fetchPages();
    } else {
      alert('Error creating page');
    }
  };

  const deletePage = async (slug) => {
    if (confirm('Delete this page?')) {
      await fetch(`/api/pages/${slug}`, { method: 'DELETE' });
      fetchPages();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pages</h1>
      <form onSubmit={createPage} className="flex gap-2 items-end mb-6">
        <div>
          <label className="block text-sm">Slug</label>
          <input value={newPage.slug} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} className="border p-2 rounded" placeholder="about" required />
        </div>
        <div>
          <label className="block text-sm">Title</label>
          <input value={newPage.title} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} className="border p-2 rounded" placeholder="About Us" required />
        </div>
        <div className="flex items-center">
          <label className="text-sm mr-2">Homepage</label>
          <input type="checkbox" checked={newPage.isHome} onChange={(e) => setNewPage({ ...newPage, isHome: e.target.checked })} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Page</button>
      </form>

      <ul className="space-y-2">
        {pages.map(p => (
          <li key={p.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <strong>{p.title}</strong> <span className="text-sm text-gray-500">/{p.slug}</span>
              {p.isHome && <span className="ml-2 text-xs bg-yellow-100 px-2 py-1 rounded">Home</span>}
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">{p.status}</span>
            </div>
            <div>
              <a href={`/dashboard/builder?page=${p.slug}`} className="text-blue-600 mr-2">Edit</a>
              <button onClick={() => deletePage(p.slug)} className="text-red-600">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
