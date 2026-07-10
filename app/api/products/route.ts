import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const products = await prisma.product.findMany({ where: { tenantId: tenant.id } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tenantSlug = token.tenantSlug as string;
  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const body = await req.json();
  const { name, price, stock, description, imageUrl } = body;
  if (!name || price === undefined) {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      description,
      imageUrl,
      tenantId: tenant.id,
    },
  });
  return NextResponse.json(product);
}
