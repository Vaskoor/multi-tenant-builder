import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { themeConfig } = body;
  if (!themeConfig) return NextResponse.json({ error: 'Missing themeConfig' }, { status: 400 });

  // Merge with existing config
  const current = (tenant.themeConfig as any) || {};
  const updated = { ...current, ...themeConfig };

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenant.id },
    data: { themeConfig: updated },
  });

  return NextResponse.json({ success: true, tenant: updatedTenant });
}
