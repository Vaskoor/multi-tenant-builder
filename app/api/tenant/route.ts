import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Missing tenant slug' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      users: true,
      products: true,
      contacts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      pageViews: {
        orderBy: { timestamp: 'desc' },
        take: 10,
      },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  return NextResponse.json(tenant);
}
