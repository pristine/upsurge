import { db } from '@/lib/prisma';
import { hasAccess, authorizedUserOn } from '@whop-apps/sdk';
import { headers } from 'next/headers';

export default async function CompanyLayout({
  params,
  children,
}: {
  params: { companyId: string };
  children: React.ReactNode;
}) {
  const access = await hasAccess({
    to: authorizedUserOn(params.companyId),
    headers,
  });

  if (!access) {
    return <p>No access.</p>;
  }

  const dbCompany = await db.company.findUnique({
    where: { whopId: params.companyId },
  });
  if (!dbCompany) {
    return <p>Company not registered.</p>;
  }

  return <div className="container mx-auto py-2">{children}</div>;
}
