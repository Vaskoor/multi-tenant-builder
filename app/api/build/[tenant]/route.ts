import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SiteRenderer } from '@/app/[tenant]/SiteRenderer';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant: tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  try {
    // Use React.createElement to avoid JSX in .ts file
    const element = React.createElement(SiteRenderer, { tenant });
    const htmlContent = renderToStaticMarkup(element);
    const fullHtml = `<!DOCTYPE html>${htmlContent}`;

    const dir = path.join(process.cwd(), 'public', 'sites', tenantSlug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), fullHtml);

    if (tenant.customDomain) {
      const domainDir = path.join(process.cwd(), 'public', 'sites', tenant.customDomain);
      await fs.mkdir(domainDir, { recursive: true });
      await fs.writeFile(path.join(domainDir, 'index.html'), fullHtml);
    }

    return NextResponse.json({
      success: true,
      message: `Site built for ${tenant.name}`,
      path: `/sites/${tenantSlug}/index.html`,
    });
  } catch (error: any) {
    console.error('Build error:', error);
    return NextResponse.json(
      { error: 'Failed to build site', details: error.message },
      { status: 500 }
    );
  }
}
