'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

// Section types
const SECTION_TYPES = [
  { id: 'hero', label: 'Hero', icon: '🎯', defaultConfig: { title: 'Welcome', subtitle: 'Subtitle', buttonText: 'Learn More', buttonLink: '#', background: '#f8f9fa' } },
  { id: 'features', label: 'Features', icon: '⭐', defaultConfig: { title: 'Features', items: [{ icon: '🚀', title: 'Feature 1', description: 'Description' }] } },
  { id: 'testimonials', label: 'Testimonials', icon: '💬', defaultConfig: { title: 'Testimonials', items: [{ name: 'John Doe', text: 'Great service!' }] } },
  { id: 'cta', label: 'Call to Action', icon: '📢', defaultConfig: { title: 'Get Started', subtitle: 'Join us today', buttonText: 'Sign Up', buttonLink: '#' } },
];

export default function BuilderPage() {
  const { data: session } = useSession();
  const tenantSlug = (session?.user as any)?.tenantSlug;
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSectionType, setSelectedSectionType] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchPages();
  }, [tenantSlug]);

  const fetchPages = async () => {
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data);
    const home = data.find(p => p.isHome);
    if (home) {
      selectPage(home);
    } else if (data.length > 0) {
      selectPage(data[0]);
    }
  };

  const selectPage = (page) => {
    setCurrentPage(page);
    setSections(page.content || []);
    setPreviewUrl(`http://${tenantSlug}.127.0.0.1.nip.io:3000/${page.slug}`);
  };

  const addSection = (type) => {
    const defaultConfig = SECTION_TYPES.find(t => t.id === type)?.defaultConfig || {};
    const newSection = { id: Date.now().toString(), type, config: defaultConfig };
    setSections([...sections, newSection]);
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id, config) => {
    setSections(sections.map(s => s.id === id ? { ...s, config } : s));
  };

  const savePage = async () => {
    if (!currentPage) return;
    const res = await fetch(`/api/pages/${currentPage.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentPage,
        content: sections,
      }),
    });
    if (res.ok) alert('Page saved!');
    else alert('Error saving page');
  };

  const publishSite = async () => {
    if (!tenantSlug) return;
    const res = await fetch(`/api/build/${tenantSlug}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) alert(`Site built! ${data.path}`);
    else alert('Build failed');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Website Builder</h1>
        <div className="flex gap-2">
          <button onClick={savePage} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">💾 Save</button>
          <button onClick={publishSite} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">🚀 Publish</button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left panel: Page list & Section selector */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold mb-2">Pages</h3>
          <ul className="space-y-1">
            {pages.map(p => (
              <li key={p.id} className={`px-2 py-1 rounded cursor-pointer ${currentPage?.id === p.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`} onClick={() => selectPage(p)}>
                {p.title} {p.isHome && '🏠'}
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <h3 className="font-semibold mb-2">Add Section</h3>
          <div className="space-y-1">
            {SECTION_TYPES.map(type => (
              <button key={type.id} onClick={() => addSection(type.id)} className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded">
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Sections list and configuration */}
        <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
          {sections.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">Add sections to build your page</div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, idx) => (
                <div key={section.id} className="bg-white p-4 rounded shadow border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{SECTION_TYPES.find(t => t.id === section.type)?.label || section.type}</span>
                    <button onClick={() => removeSection(section.id)} className="text-red-500 text-sm">✕</button>
                  </div>
                  <SectionConfig section={section} update={(config) => updateSection(section.id, config)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live preview iframe */}
        <div className="w-1/3 bg-white border-l border-gray-200 p-2">
          <div className="text-sm text-gray-500 mb-1">Live Preview</div>
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-full border border-gray-300 rounded" title="Preview" />
          ) : (
            <div className="text-center text-gray-400 mt-20">Select a page to preview</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to render configuration for a section type
function SectionConfig({ section, update }) {
  const { type, config } = section;
  switch (type) {
    case 'hero':
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input placeholder="Title" value={config.title || ''} onChange={(e) => update({ ...config, title: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Subtitle" value={config.subtitle || ''} onChange={(e) => update({ ...config, subtitle: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Button Text" value={config.buttonText || ''} onChange={(e) => update({ ...config, buttonText: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Button Link" value={config.buttonLink || ''} onChange={(e) => update({ ...config, buttonLink: e.target.value })} className="border p-1 rounded" />
          <input type="color" value={config.background || '#f8f9fa'} onChange={(e) => update({ ...config, background: e.target.value })} className="border p-1 rounded" />
        </div>
      );
    case 'features':
      return (
        <div className="mt-2">
          <input placeholder="Title" value={config.title || ''} onChange={(e) => update({ ...config, title: e.target.value })} className="border p-1 rounded w-full" />
          {config.items && config.items.map((item, i) => (
            <div key={i} className="flex gap-2 mt-1">
              <input placeholder="Icon" value={item.icon || ''} onChange={(e) => { const newItems = [...config.items]; newItems[i].icon = e.target.value; update({ ...config, items: newItems }); }} className="border p-1 rounded w-12" />
              <input placeholder="Title" value={item.title || ''} onChange={(e) => { const newItems = [...config.items]; newItems[i].title = e.target.value; update({ ...config, items: newItems }); }} className="border p-1 rounded flex-1" />
              <input placeholder="Description" value={item.description || ''} onChange={(e) => { const newItems = [...config.items]; newItems[i].description = e.target.value; update({ ...config, items: newItems }); }} className="border p-1 rounded flex-1" />
              <button onClick={() => { const newItems = config.items.filter((_, idx) => idx !== i); update({ ...config, items: newItems }); }} className="text-red-500">✕</button>
            </div>
          ))}
          <button onClick={() => { const newItems = [...(config.items || []), { icon: '🚀', title: 'New Feature', description: 'Description' }]; update({ ...config, items: newItems }); }} className="text-blue-600 text-sm mt-1">+ Add Feature</button>
        </div>
      );
    case 'testimonials':
      return (
        <div className="mt-2">
          <input placeholder="Title" value={config.title || ''} onChange={(e) => update({ ...config, title: e.target.value })} className="border p-1 rounded w-full" />
          {config.items && config.items.map((item, i) => (
            <div key={i} className="flex gap-2 mt-1">
              <input placeholder="Name" value={item.name || ''} onChange={(e) => { const newItems = [...config.items]; newItems[i].name = e.target.value; update({ ...config, items: newItems }); }} className="border p-1 rounded flex-1" />
              <input placeholder="Text" value={item.text || ''} onChange={(e) => { const newItems = [...config.items]; newItems[i].text = e.target.value; update({ ...config, items: newItems }); }} className="border p-1 rounded flex-1" />
              <button onClick={() => { const newItems = config.items.filter((_, idx) => idx !== i); update({ ...config, items: newItems }); }} className="text-red-500">✕</button>
            </div>
          ))}
          <button onClick={() => { const newItems = [...(config.items || []), { name: 'Customer', text: 'Great service!' }]; update({ ...config, items: newItems }); }} className="text-blue-600 text-sm mt-1">+ Add Testimonial</button>
        </div>
      );
    case 'cta':
      return (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input placeholder="Title" value={config.title || ''} onChange={(e) => update({ ...config, title: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Subtitle" value={config.subtitle || ''} onChange={(e) => update({ ...config, subtitle: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Button Text" value={config.buttonText || ''} onChange={(e) => update({ ...config, buttonText: e.target.value })} className="border p-1 rounded" />
          <input placeholder="Button Link" value={config.buttonLink || ''} onChange={(e) => update({ ...config, buttonLink: e.target.value })} className="border p-1 rounded" />
        </div>
      );
    default:
      return <div className="text-sm text-gray-400">No configuration</div>;
  }
}
