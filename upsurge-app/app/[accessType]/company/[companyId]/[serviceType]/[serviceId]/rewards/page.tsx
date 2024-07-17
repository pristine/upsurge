'use client';

import {
  Flex,
  SegmentedControlContent,
  SegmentedControlList,
  SegmentedControlRoot,
  SegmentedControlTrigger,
} from 'frosted-ui';
import RewardsTable from '@/components/rewards/RewardsTable';
import PendingRewardsTable from '@/components/rewards/PendingRewardsTable';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

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
  const searchParams = useSearchParams();

  const [segmenedControlValue, setSegmentedControlValue] = useState(
    searchParams.get('view') === 'pending_rewards'
      ? 'pendingRewards'
      : 'rewards'
  );

  return (
    <Flex
      className="w-full bg-gray-2 rounded-lg px-6 py-6 gap-4"
      direction="column"
    >
      <SegmentedControlRoot
        defaultValue={segmenedControlValue}
        value={segmenedControlValue}
        onValueChange={(val) => {
          setSegmentedControlValue(val);
        }}
      >
        <Flex className="w-full" justify="center" align="center">
          <SegmentedControlList className="w-1/2">
            <SegmentedControlTrigger value="rewards">
              Rewards
            </SegmentedControlTrigger>
            <SegmentedControlTrigger value="pendingRewards">
              Pending Rewards
            </SegmentedControlTrigger>
          </SegmentedControlList>
        </Flex>
        <Flex className="w-full" py="4">
          <SegmentedControlContent value="rewards" className="w-full">
            <RewardsTable
              accessType={params.accessType}
              companyId={params.companyId}
              serviceId={params.serviceId}
              serviceType={params.serviceType}
            />
          </SegmentedControlContent>
          <SegmentedControlContent value="pendingRewards" className="w-full">
            <PendingRewardsTable
              accessType={params.accessType}
              companyId={params.companyId}
              serviceId={params.serviceId}
              serviceType={params.serviceType}
            />
          </SegmentedControlContent>
        </Flex>
      </SegmentedControlRoot>
    </Flex>
  );
}
