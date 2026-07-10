#!/bin/bash
set -e

echo "🔧 Fixing Tailwind for tenant sites..."

# Backup current files
cp app/[tenant]/page.tsx app/[tenant]/page.tsx.bak 2>/dev/null || true
cp app/[tenant]/SiteRenderer.tsx app/[tenant]/SiteRenderer.tsx.bak 2>/dev/null || true

# 1. Update tenant page to return only the component (no html/body)
cat > app/[tenant]/page.tsx << 'EOF'
import { prisma } from '@/lib/db';
import { SiteRenderer } from './SiteRenderer';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantPage({ params }: PageProps) {
  const { tenant: slug } = await params;
  const headersList = await headers();
  const customHost = headersList.get('x-custom-host');

  let tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant && customHost) {
    tenant = await prisma.tenant.findUnique({
      where: { customDomain: customHost },
    });
    if (!tenant) notFound();
  }

  if (!tenant) notFound();

  return <SiteRenderer tenant={tenant} />;
}

export const dynamic = 'force-dynamic';
EOF

# 2. Update SiteRenderer to return only the theme component
cat > app/[tenant]/SiteRenderer.tsx << 'EOF'
import { Tenant } from '@prisma/client';
import { getThemeComponent, DEFAULT_THEME } from '@/lib/themes';

interface SiteRendererProps {
  tenant: Tenant;
}

export function SiteRenderer({ tenant }: SiteRendererProps) {
  const config = tenant.themeConfig as any || {};
  const themeName = config.theme || DEFAULT_THEME;
  const ThemeComponent = getThemeComponent(themeName);
  return <ThemeComponent tenant={tenant} />;
}
EOF

# 3. Ensure globals.css has Tailwind directives
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# 4. Ensure layout.tsx has fonts and imports globals.css
cat > app/layout.tsx << 'EOF'
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Tenant Builder',
  description: 'SaaS Website Builder for Nepal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.tailwindcss.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
EOF

echo "✅ All fixes applied."
echo "Restart dev server: npm run dev"
echo "Visit http://merovai-123.localhost:3000 (or use nip.io) – Tailwind will now work."