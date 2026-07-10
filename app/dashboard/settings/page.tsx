'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// List of available themes (imported from theme registry)
const THEMES = ['modern', 'dark', 'playful', 'minimal', 'corporate', 'vintage', 'phulbari'];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    theme: 'modern',
    primary_color: '#0070f3',
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: 'Get Started',
    hero_button_link: '#',
    features: [{ title: '', description: '' }],
    about_title: 'About Us',
    about_description: '',
    about_image: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_youtube: '',
    footer_text: '© 2025 All rights reserved.',
  });

  const tenantSlug = (session?.user as any)?.tenantSlug;

  const fetchTenant = async () => {
    if (!tenantSlug) return;
    setLoading(true);
    const res = await fetch(`/api/tenant?slug=${tenantSlug}`);
    const data = await res.json();
    setTenant(data);
    const c = data?.themeConfig || {};
    setConfig({
      theme: c.theme || 'modern',
      primary_color: c.primary_color || '#0070f3',
      hero_title: c.hero_title || 'Welcome to our store',
      hero_subtitle: c.hero_subtitle || 'We deliver quality',
      hero_button_text: c.hero_button_text || 'Get Started',
      hero_button_link: c.hero_button_link || '#',
      features: c.features || [{ title: 'Feature 1', description: 'Description' }],
      about_title: c.about_title || 'About Us',
      about_description: c.about_description || 'We are a team dedicated to quality.',
      about_image: c.about_image || '',
      social_facebook: c.social_facebook || '',
      social_instagram: c.social_instagram || '',
      social_twitter: c.social_twitter || '',
      social_youtube: c.social_youtube || '',
      footer_text: c.footer_text || '© 2025 All rights reserved.',
    });
    setLoading(false);
  };

  useEffect(() => { fetchTenant(); }, [tenantSlug]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/website', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeConfig: config }),
    });
    if (res.ok) {
      alert('Settings saved successfully!');
      fetchTenant();
    } else {
      alert('Error saving settings');
    }
    setSaving(false);
  };

  const addFeature = () => {
    setConfig({ ...config, features: [...config.features, { title: '', description: '' }] });
  };
  const removeFeature = (idx: number) => {
    const newFeatures = config.features.filter((_, i) => i !== idx);
    setConfig({ ...config, features: newFeatures });
  };
  const updateFeature = (idx: number, field: string, value: string) => {
    const newFeatures = config.features.map((f, i) => i === idx ? { ...f, [field]: value } : f);
    setConfig({ ...config, features: newFeatures });
  };

  if (loading) return <div className="text-center py-8">Loading settings...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🌐 Website Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Theme & Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <select
              value={config.theme}
              onChange={(e) => setConfig({ ...config, theme: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {THEMES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Color</label>
            <input
              type="color"
              value={config.primary_color}
              onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
              className="mt-1 w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Title</label>
            <input
              type="text"
              value={config.hero_title}
              onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
            <input
              type="text"
              value={config.hero_subtitle}
              onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Button Text</label>
            <input
              type="text"
              value={config.hero_button_text}
              onChange={(e) => setConfig({ ...config, hero_button_text: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Button Link</label>
            <input
              type="text"
              value={config.hero_button_link}
              onChange={(e) => setConfig({ ...config, hero_button_link: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="#"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        {config.features.map((f, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-start">
            <div className="flex-1">
              <input
                placeholder="Feature title"
                value={f.title}
                onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <input
                placeholder="Description"
                value={f.description}
                onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <button onClick={() => removeFeature(idx)} className="text-red-600 px-2">✕</button>
          </div>
        ))}
        <button onClick={addFeature} className="text-blue-600 text-sm">+ Add feature</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">About Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">About Title</label>
            <input
              type="text"
              value={config.about_title}
              onChange={(e) => setConfig({ ...config, about_title: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">About Image URL</label>
            <input
              type="text"
              value={config.about_image}
              onChange={(e) => setConfig({ ...config, about_image: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">About Description</label>
          <textarea
            rows={3}
            value={config.about_description}
            onChange={(e) => setConfig({ ...config, about_description: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700">Facebook</label><input type="text" value={config.social_facebook} onChange={(e) => setConfig({ ...config, social_facebook: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Instagram</label><input type="text" value={config.social_instagram} onChange={(e) => setConfig({ ...config, social_instagram: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Twitter</label><input type="text" value={config.social_twitter} onChange={(e) => setConfig({ ...config, social_twitter: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
          <div><label className="block text-sm font-medium text-gray-700">YouTube</label><input type="text" value={config.social_youtube} onChange={(e) => setConfig({ ...config, social_youtube: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" /></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">Footer</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Footer Text</label>
          <input
            type="text"
            value={config.footer_text}
            onChange={(e) => setConfig({ ...config, footer_text: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : '💾 Save All Settings'}
      </button>
    </div>
  );
}
