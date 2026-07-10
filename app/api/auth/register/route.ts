import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const { name, email, password, tenantName } = await req.json();

  if (!email || !password || !tenantName) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  // Create tenant and user in a transaction
  const hashedPassword = await bcrypt.hash(password, 10);
  const slug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'my-site';

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if slug taken, if so add random suffix
      let finalSlug = slug;
      let counter = 0;
      while (await tx.tenant.findUnique({ where: { slug: finalSlug } })) {
        counter++;
        finalSlug = `${slug}-${counter}`;
      }

      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: finalSlug,
          plan: 'free',
          themeConfig: { theme: 'modern', primary_color: '#0070f3', hero_title: `Welcome to ${tenantName}` },
          featureOverrides: {},
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'admin',
          tenantId: tenant.id,
        },
      });

      // Update tenant with ownerId
      await tx.tenant.update({
        where: { id: tenant.id },
        data: { ownerId: user.id },
      });

      return { tenant, user };
    });

    return NextResponse.json({ success: true, tenant: result.tenant });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
