import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant: tenantSlug } = await params;
  const { name, email, phone, message, subject } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: { owner: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
  }

  const contact = await prisma.contact.create({
    data: {
      tenantId: tenant.id,
      name,
      email,
      phone,
      message,
      subject: subject || 'Contact Form Submission',
    },
  });

  try {
    if (process.env.RESEND_API_KEY && tenant.owner?.email) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to: tenant.owner.email,
        subject: `New contact from ${tenant.name}`,
        html: `
          <h2>New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      });
    }
  } catch (e) {
    console.error('Email send failed:', e);
  }

  return NextResponse.json({ success: true, id: contact.id });
}
