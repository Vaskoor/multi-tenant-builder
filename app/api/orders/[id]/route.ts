import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: { id: params.id, tenantId: tenant.id },
    include: { items: { include: { product: true } }, invoice: true },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { status } = body;
  const order = await prisma.order.updateMany({
    where: { id: params.id, tenantId: tenant.id },
    data: { status },
  });
  if (order.count === 0) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
