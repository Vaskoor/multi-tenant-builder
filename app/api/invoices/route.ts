import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const invoices = await prisma.invoice.findMany({
    where: { order: { tenantId: tenant.id } },
    include: { order: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { orderId, dueDate } = body;
  if (!orderId) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: tenant.id },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: order.id,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'unpaid',
    },
    include: { order: true },
  });
  return NextResponse.json(invoice);
}
