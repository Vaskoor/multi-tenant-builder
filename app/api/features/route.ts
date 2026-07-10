import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { tenantSlug, featureKey, enabled } = body;

  if (!tenantSlug || !featureKey) {
    return NextResponse.json({ error: 'Missing tenantSlug or featureKey' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const current = (tenant.featureOverrides as any) || {};
  const updated = { ...current, [featureKey]: enabled };

  const updatedTenant = await prisma.tenant.update({
    where: { slug: tenantSlug },
    data: { featureOverrides: updated },
  });

  return NextResponse.json({ success: true, tenant: updatedTenant, feature: featureKey, enabled });
}
