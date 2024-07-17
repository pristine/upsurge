'use client';

import { Flex } from 'frosted-ui';
import UsersTable from '@/components/user/UsersTable';

export default function UsersPage({
  params,
}: {
  params: {
    accessType: 'whop' | 'web';
    companyId: string;
    serviceType: string;
    serviceId: string;
  };
}) {
  return (
    <Flex direction="column" className="w-full">
      <UsersTable
        accessType={params.accessType}
        companyId={params.companyId}
        serviceType={params.serviceType}
        serviceId={params.serviceId}
      />
    </Flex>
  );
}
