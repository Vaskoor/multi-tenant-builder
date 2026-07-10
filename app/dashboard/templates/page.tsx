'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

const TEMPLATES = [
  { name: 'Modern Business', theme: 'modern', primary: '#0070f3', hero: 'Welcome to our company', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
  { name: 'Dark Tech', theme: 'dark', primary: '#00e5ff', hero: 'Tech solutions', features: ['Fast', 'Reliable', 'Secure'] },
  { name: 'Playful Creative', theme: 'playful', primary: '#ff4081', hero: 'Creativity unleashed', features: ['Design', 'Innovation', 'Fun'] },
];

export default function TemplatesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const applyTemplate = async (template) => {
    if (!confirm(`Apply "${template.name}" template? This will overwrite your current settings.`)) return;
    setLoading(true);
    const config = {
      theme: template.theme,
      primary_color: template.primary,
      hero_title: template.hero,
      features: template.features.map((f, i) => ({ title: f, description: `Description for ${f}` })),
      about_title: 'About Us',
      about_description: 'We are dedicated to quality.',
    };
    const res = await fetch('/api/website', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeConfig: config }),
    });
    if (res.ok) {
      alert('Template applied successfully!');
      // Optionally rebuild site
      const tenantSlug = (session?.user as any)?.tenantSlug;
      if (tenantSlug) {
        await fetch(`/api/build/${tenantSlug}`, { method: 'POST' });
      }
    } else {
      alert('Error applying template');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEMPLATES.map((t, idx) => (
          <div key={idx} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <div className="w-full h-32 bg-gray-100 rounded mb-4 flex items-center justify-center" style={{ backgroundColor: t.primary + '20' }}>
              <span className="text-2xl" style={{ color: t.primary }}>{t.name.charAt(0)}</span>
            </div>
            <h3 className="font-bold text-lg">{t.name}</h3>
            <p className="text-sm text-gray-500">Theme: {t.theme}</p>
            <button onClick={() => applyTemplate(t)} disabled={loading} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50">Apply</button>
          </div>
        ))}
      </div>
    </div>
  );
}
