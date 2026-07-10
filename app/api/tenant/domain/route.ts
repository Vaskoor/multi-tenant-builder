import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPlanLimits } from '@/lib/features';

export async function PATCH(req: NextRequest) {
  const { tenantSlug, domain } = await req.json();

  if (!tenantSlug) {
    return NextResponse.json({ error: 'Missing tenantSlug' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  // Check plan limit
  const limits = getPlanLimits(tenant.plan);
  if (!limits.customDomain && domain) {
    return NextResponse.json(
      { error: 'Custom domains are not available on your plan. Please upgrade.' },
      { status: 403 }
    );
  }

  // Check if domain already taken by another tenant
  if (domain) {
    const existing = await prisma.tenant.findUnique({
      where: { customDomain: domain },
    });
    if (existing && existing.id !== tenant.id) {
      return NextResponse.json(
        { error: 'This domain is already in use by another site.' },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.tenant.update({
    where: { slug: tenantSlug },
    data: {
      customDomain: domain || null,
      domainVerified: false, // require re-verification
    },
  });

  return NextResponse.json({
    success: true,
    message: domain ? 'Domain updated. Please add the required DNS records.' : 'Domain removed.',
    tenant: updated,
  });
}
