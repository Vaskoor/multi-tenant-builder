import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_THEME } from '@/lib/themes';

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { tenantSlug, theme, primary_color, hero_title, hero_subtitle } = body;

  if (!tenantSlug) {
    return NextResponse.json({ error: 'Missing tenantSlug' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const current = (tenant.themeConfig as any) || { theme: DEFAULT_THEME, primary_color: '#0070f3' };
  const updated = {
    ...current,
    ...(theme && { theme }),
    ...(primary_color && { primary_color }),
    ...(hero_title !== undefined && { hero_title }),
    ...(hero_subtitle !== undefined && { hero_subtitle }),
  };

  const updatedTenant = await prisma.tenant.update({
    where: { slug: tenantSlug },
    data: { themeConfig: updated },
  });

  return NextResponse.json({ success: true, tenant: updatedTenant, config: updated });
}
