import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant: tenantSlug } = await params;
  const action = req.nextUrl.searchParams.get('action');

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { products: true, contacts: true, pageViews: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  if (action === 'stats') {
    return NextResponse.json({
      pageViews: tenant.pageViews.length,
      contacts: tenant.contacts.length,
      products: tenant.products.length,
    });
  }

  if (action === 'view') {
    const { path, visitorId, referrer, userAgent, ip } = await req.json();
    await prisma.pageView.create({
      data: {
        tenantId: tenant.id,
        path: path || '/',
        visitorId: visitorId || 'anonymous',
        referrer: referrer || '',
        userAgent: userAgent || '',
        ip: ip || '',
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ pageViews: tenant.pageViews });
}
