import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const pages = await prisma.page.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(pages);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { slug, title, content, isHome } = body;
  if (!slug || !title) {
    return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
  }
  // Check uniqueness
  const existing = await prisma.page.findFirst({
    where: { tenantId: tenant.id, slug },
  });
  if (existing) {
    return NextResponse.json({ error: 'Page with this slug already exists' }, { status: 400 });
  }

  const page = await prisma.page.create({
    data: {
      tenantId: tenant.id,
      slug,
      title,
      content: content || [],
      isHome: isHome || false,
      status: 'draft',
    },
  });
  return NextResponse.json(page);
}
