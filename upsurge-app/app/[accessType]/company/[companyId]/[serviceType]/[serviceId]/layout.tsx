import NavBar from '@/components/dashboard/NavBar';
import { db } from '@/lib/prisma';
import { getCompanyWhereFromType } from '@/util/company';

export default async function ProductLayout({
  params,
  children,
}: {
  params: {
    accessType: 'whop' | 'web';
    companyId: string;
    serviceType: string;
    serviceId: string;
  };
  children: React.ReactNode;
}) {
  const serviceExists = await db.service.findUnique({
    where: {
      id_type: {
        type: params.serviceType as 'discord',
        id: params.serviceId,
      },
      Company: getCompanyWhereFromType(
        params.accessType,
        params.companyId,
        params.serviceId,
        params.serviceType
      ),
    },
  });
  if (!serviceExists) {
    return <p>Service not found.</p>;
  }

  return (
    <div className="flex flex-col py-4">
      <NavBar
        accessType={params.accessType}
        companyId={params.companyId}
        serviceId={params.serviceId}
        serviceName={serviceExists.nickname}
        serviceType={params.serviceType}
      />
      <div className="py-10">{children}</div>
    </div>
  );
}
