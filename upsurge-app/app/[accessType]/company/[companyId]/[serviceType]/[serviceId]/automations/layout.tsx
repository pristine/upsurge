import { db } from '@/lib/prisma';

export default async function AutomationsLayout({
  params,
  children,
}: {
  params: { companyId: string; serviceType: string; serviceId: string };
  children: React.ReactNode;
}) {
  const company = await db.company.findUnique({
    where: {
      whopId: params.companyId,
    },
  });
  if (!company) {
    return <p>Company does not exist.</p>;
  }

  if (!company.automations) {
    return (
      <p>Automations not available, considering upgrading to a higher tier.</p>
    );
  }

  return (
    <div className="flex flex-col">
      <div>{children}</div>
    </div>
  );
}
