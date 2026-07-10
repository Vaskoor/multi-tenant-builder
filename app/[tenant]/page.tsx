import { prisma } from '@/lib/db';
import { SiteRenderer } from './SiteRenderer';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default async function TenantPage({ params }: PageProps) {
  const { tenant: slug } = await params;
  const headersList = await headers();
  const customHost = headersList.get('x-custom-host');

  let tenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!tenant && customHost) {
    tenant = await prisma.tenant.findUnique({
      where: { customDomain: customHost },
    });
    if (!tenant) notFound();
  }

  if (!tenant) notFound();

  return <SiteRenderer tenant={tenant} />;
}

export const dynamic = 'force-dynamic';
