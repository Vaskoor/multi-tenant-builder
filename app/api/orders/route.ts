import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { tenantId: tenant.id },
    include: { items: { include: { product: true } }, invoice: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { customerName, customerEmail, customerPhone, items, discount, tax, paymentMethod, notes } = body;
  if (!customerName || !items || items.length === 0) {
    return NextResponse.json({ error: 'Customer name and items are required' }, { status: 400 });
  }

  let totalAmount = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId, tenantId: tenant.id },
    });
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 });
    }
    const unitPrice = product.price;
    const totalPrice = unitPrice * item.quantity;
    totalAmount += totalPrice;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
    });
  }

  const grandTotal = totalAmount + (tax || 0) - (discount || 0);
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      tenantId: tenant.id,
      customerName,
      customerEmail,
      customerPhone,
      status: 'pending',
      totalAmount,
      discount: discount || 0,
      tax: tax || 0,
      grandTotal,
      paymentMethod,
      notes,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  // Update stock
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // Create ledger entry (income)
  await prisma.ledger.create({
    data: {
      tenantId: tenant.id,
      entryType: 'income',
      category: 'sale',
      description: `Order ${orderNumber}`,
      amount: grandTotal,
      referenceId: order.id,
    },
  });

  return NextResponse.json(order);
}
