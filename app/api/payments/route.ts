import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { orderId, amount, method, reference } = body;
  if (!orderId || !amount || !method) {
    return NextResponse.json({ error: 'Order ID, amount, and method required' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId: tenant.id },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      tenantId: tenant.id,
      orderId: order.id,
      amount,
      method,
      reference,
      status: 'completed',
    },
  });

  // Update order status to paid if fully paid
  const totalPaid = await prisma.payment.aggregate({
    where: { orderId: order.id },
    _sum: { amount: true },
  });
  if (totalPaid._sum.amount >= order.grandTotal) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });
  }

  // Update invoice if exists
  const invoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
  if (invoice) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: { increment: amount },
        status: totalPaid._sum.amount >= order.grandTotal ? 'paid' : 'unpaid',
      },
    });
  }

  return NextResponse.json(payment);
}
