import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const { slug } = await params;
  const page = await prisma.page.findFirst({
    where: { tenantId: tenant.id, slug },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const { slug } = await params;
  const body = await req.json();
  const { title, content, status, isHome } = body;
  const page = await prisma.page.updateMany({
    where: { tenantId: tenant.id, slug },
    data: { title, content, status, isHome },
  });
  if (page.count === 0) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const { slug } = await params;
  const page = await prisma.page.deleteMany({
    where: { tenantId: tenant.id, slug },
  });
  if (page.count === 0) return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
