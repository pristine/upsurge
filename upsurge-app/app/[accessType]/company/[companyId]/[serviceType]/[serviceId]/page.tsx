'use client';

import Users from '@/components/dashboard/Users';
import PendingRewards from '@/components/dashboard/PendingRewards';
import TopPointHolders from '@/components/dashboard/TopPointHolders';
import { type User } from '@/types/users';
import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import useSWR, { type KeyedMutator } from 'swr';
import PointsActivity from '@/components/dashboard/PointsActivity';
import { type PointsDistribution } from '@/types/points';
import React, {
  type Dispatch,
  type SetStateAction,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import QuickActions from '@/components/dashboard/QuickActions';
import {
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  Flex,
  Link,
  Text,
} from 'frosted-ui';
import { BarLoader, ClipLoader } from 'react-spinners';
import { type Service } from '@/types/service';
import { type Channel, type Role } from '@/types/discord';
import DiscordUserRolesBody from '@/components/service/DiscordRoles';
import DiscordMainChannelBody from '@/components/service/DiscordChannel';

function SetupDiscordUserRolesSelection({
  accessType,
  serviceId,
  serviceType,
  companyId,
  refreshServiceData,
}: {
  accessType: 'whop' | 'web';
  serviceType: string;
  serviceId: string;
  companyId: string;
  refreshServiceData: KeyedMutator<ApiResponse<Service>>;
}) {
  const { data: rolesData, isLoading: isRolesDataLoading } = useSWR<
    ApiResponse<{
      roles: Role[];
      currentRoles: string[];
    }>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/roles`,
    fetcher
  );

  return (
    <>
      <DialogTitle>User Roles Selection</DialogTitle>
      <DialogDescription>
        Choose the role(s) where Upsurge will recognize as valid users.
      </DialogDescription>
      {isRolesDataLoading || !rolesData?.data ? (
        <Flex className="w-full" justify="center" align="center">
          <ClipLoader color="#8884d8" />
        </Flex>
      ) : (
        <DiscordUserRolesBody
          accessType={accessType}
          companyId={companyId}
          refreshServiceData={refreshServiceData}
          rolesData={rolesData}
          serviceId={serviceId}
          serviceType={serviceType}
        />
      )}
    </>
  );
}

function SetupDiscordMainChannelSelection({
  accessType,
  serviceId,
  serviceType,
  companyId,
  refreshServiceData,
}: {
  accessType: 'whop' | 'web';
  serviceType: string;
  serviceId: string;
  companyId: string;
  refreshServiceData: KeyedMutator<ApiResponse<Service>>;
}) {
  const { data: channelData, isLoading: isChannelDataLoading } = useSWR<
    ApiResponse<Channel[]>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/channel`,
    fetcher
  );

  return (
    <>
      <DialogTitle>Main Channel Selection</DialogTitle>
      <DialogDescription>
        Select the main text channel of the server.
      </DialogDescription>
      {isChannelDataLoading || !channelData?.data ? (
        <Flex className="w-full" justify="center" align="center">
          <ClipLoader color="#8884d8" />
        </Flex>
      ) : (
        <DiscordMainChannelBody
          accessType={accessType}
          channelData={channelData}
          companyId={companyId}
          refreshServiceData={refreshServiceData}
          serviceId={serviceId}
          serviceType={serviceType}
          type="mainChannel"
        />
      )}
    </>
  );
}

function SetupDiscordLogChannelSelection({
  accessType,
  serviceId,
  serviceType,
  companyId,
  refreshServiceData,
}: {
  accessType: 'whop' | 'web';
  serviceType: string;
  serviceId: string;
  companyId: string;
  refreshServiceData: KeyedMutator<ApiResponse<Service>>;
}) {
  const { data: channelData, isLoading: isChannelDataLoading } = useSWR<
    ApiResponse<Channel[]>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/channel`,
    fetcher
  );

  return (
    <>
      <DialogTitle>Log Channel Selection</DialogTitle>
      <DialogDescription>
        Select the log text channel of the server.
      </DialogDescription>
      {isChannelDataLoading || !channelData?.data ? (
        <Flex className="w-full" justify="center" align="center">
          <ClipLoader color="#8884d8" />
        </Flex>
      ) : (
        <DiscordMainChannelBody
          accessType={accessType}
          channelData={channelData}
          companyId={companyId}
          refreshServiceData={refreshServiceData}
          serviceId={serviceId}
          serviceType={serviceType}
          type="logChannel"
        />
      )}
    </>
  );
}

// eslint-disable-next-line react/display-name
const LeftSideCharts = forwardRef(
  (
    {
      accessType,
      className,
      companyId,
      serviceId,
      serviceType,
      shouldRefresh,
      filter,
      setFilter,
    }: {
      accessType: 'whop' | 'web';
      className: string;
      companyId: string;
      serviceId: string;
      serviceType: string;
      shouldRefresh: boolean;
      filter: string;
      setFilter: Dispatch<SetStateAction<string>>;
    },
    ref
  ) => {
    const { data: rewards, isLoading: isRewardsLoading } = useSWR<
      ApiResponse<{
        rewardsCount: number;
        pendingRewardsCount: number;
        groupedPendingRewards: Array<{
          date: number;
          amount: number;
        }>;
      }>
    >(
      `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/rewards`,
      fetcher
    );

    const { signal } = new AbortController();
    const {
      data: points,
      isLoading: isPointsLoading,
      mutate: pointsMutate,
    } = useSWR<ApiResponse<PointsDistribution>>(
      `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/points/distribution?timeframe=${filter}`,
      async (url: string) => await fetcher(url, { signal, cache: 'no-store' })
    );

    const {
      data: users,
      isLoading: isUsersLoading,
      mutate: usersMutate,
    } = useSWR<
      ApiResponse<{
        totalUsers: number;
        newUsers: Array<{
          day: Date;
          count: number;
        }>;
      }>
    >(
      `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users`,
      fetcher
    );

    useEffect(() => {
      void usersMutate();
    }, [shouldRefresh]);

    useEffect(() => {
      void pointsMutate();
    }, [filter]);

    return (
      <div className={className} ref={ref as React.LegacyRef<HTMLDivElement>}>
        <div className="gap-6 flex flex-row">
          <PendingRewards
            isRewardsLoading={isRewardsLoading}
            pendingRewards={rewards?.data?.pendingRewardsCount ?? 0}
            groupedPendingRewards={rewards?.data?.groupedPendingRewards ?? []}
          />
          <Users
            isUsersLoading={isUsersLoading}
            users={
              users?.data ?? {
                newUsers: Array(7)
                  .fill(null)
                  .map((_, index) => ({
                    day: new Date(Date.now() - 86400000 * index),
                    count: 0,
                  })),
                totalUsers: 0,
              }
            }
          />
        </div>
        <div>
          <PointsActivity
            points={
              points?.data ?? {
                totalProcessed: 0,
                totalUnprocessed: 0,
                totalUsers: 0,
              }
            }
            isPointsLoading={isPointsLoading}
            setFilter={setFilter}
            filter={filter}
          />
        </div>
      </div>
    );
  }
);

function RightSideCharts({
  accessType,
  className,
  companyId,
  serviceId,
  serviceType,
  shouldRefresh,
}: {
  accessType: 'whop' | 'web';
  className: string;
  companyId: string;
  serviceId: string;
  serviceType: string;
  shouldRefresh: boolean;
}) {
  const {
    data: users,
    isLoading: isUsersLoading,
    mutate: usersMutate,
  } = useSWR<ApiResponse<User[]>>(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users/top`,
    fetcher
  );

  useEffect(() => {
    void usersMutate();
  }, [shouldRefresh]);

  return (
    <div className={className}>
      <TopPointHolders
        users={users?.data ?? []}
        isUsersLoading={isUsersLoading}
      />
    </div>
  );
}

function BottomCharts({
  accessType,
  className,
  serviceId,
  serviceType,
  companyId,
  shouldRefresh,
  filter,
}: {
  accessType: 'whop' | 'web';
  className: string;
  serviceId: string;
  serviceType: string;
  companyId: string;
  shouldRefresh: boolean;
  filter: string;
}) {
  useEffect(() => {}, [shouldRefresh]);

  return (
    <div className={className}>
      <QuickActions
        accessType={accessType}
        companyId={companyId}
        serviceId={serviceId}
        serviceType={serviceType}
        filter={filter}
      />
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: {
    accessType: 'whop' | 'web';
    companyId: string;
    serviceType: string;
    serviceId: string;
  };
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPage, setDialogPage] = useState(1);
  const [shouldFetch, setShouldFetch] = useState(true);

  const {
    data: serviceData,
    isLoading: isServiceDataLoading,
    mutate: refreshServiceData,
  } = useSWR<ApiResponse<Service>>(
    () =>
      `/${params.accessType}/api/company/${params.companyId}/services/${params.serviceType}/${params.serviceId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: shouldFetch ? 5000 : 0,
    }
  );

  const leftSideChartRef = useRef<HTMLDivElement>(null);

  const [rightSideChartHeight, setRightSideChartHeight] = useState(0);

  useEffect(() => {
    if (leftSideChartRef.current) {
      setRightSideChartHeight(leftSideChartRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    if (serviceData?.data) {
      if (!serviceData.data.connected) {
        setIsDialogOpen(true);
      } else {
        if (serviceData.data.connected) {
          setShouldFetch(false);
        }

        if (!serviceData.data.setRoles) {
          setIsDialogOpen(true);
          setDialogPage(2);
        } else if (!serviceData.data.setMainChannel) {
          setIsDialogOpen(true);
          setDialogPage(3);
        } else if (!serviceData.data.setLogChannel) {
          setIsDialogOpen(true);
          setDialogPage(4);
        } else {
          setShouldFetch(false);
          setIsDialogOpen(false);
        }
      }
    }
  }, [serviceData?.data]);

  const [distributionFilter, setDistributionFilter] = useState('all_time');

  const botInviteUrl =
    'https://discord.com/api/oauth2/authorize?client_id=1187538026226794506&permissions=412317772864&scope=bot+applications.commands';

  return isServiceDataLoading ? (
    <Flex justify="center" align="center">
      <ClipLoader color="#8884d8" />
    </Flex>
  ) : (
    <div className="grid grid-cols-3 gap-6 w-full justify-between">
      <LeftSideCharts
        accessType={params.accessType}
        ref={leftSideChartRef}
        className="col-span-2 flex flex-col gap-6"
        serviceId={params.serviceId}
        serviceType={params.serviceType}
        shouldRefresh={shouldFetch}
        companyId={params.companyId}
        filter={distributionFilter}
        setFilter={setDistributionFilter}
      />
      <RightSideCharts
        accessType={params.accessType}
        className={`col-span-1 max-h-[${rightSideChartHeight}px]`}
        serviceId={params.serviceId}
        serviceType={params.serviceType}
        shouldRefresh={shouldFetch}
        companyId={params.companyId}
      />
      <BottomCharts
        accessType={params.accessType}
        className="col-span-3"
        serviceId={params.serviceId}
        serviceType={params.serviceType}
        shouldRefresh={shouldFetch}
        companyId={params.companyId}
        filter={distributionFilter}
      />
      <DialogRoot open={isDialogOpen}>
        <DialogContent>
          {dialogPage === 1 && params.serviceType === 'discord' && (
            <>
              <DialogTitle>Connect Discord Bot</DialogTitle>
              <Flex
                direction="column"
                gap="8"
                justify="center"
                className="w-full"
              >
                <Text>
                  Click{' '}
                  <Link target="_blank" href={botInviteUrl}>
                    here
                  </Link>{' '}
                  to add our bot or{' '}
                  <Text
                    color="purple"
                    className="hover:cursor-pointer"
                    onClick={async () => {
                      await navigator.clipboard.writeText(botInviteUrl);
                    }}
                  >
                    here
                  </Text>{' '}
                  to copy the invite link to your clipboard!
                </Text>
                <Flex
                  className="w-full"
                  justify="center"
                  align="center"
                  direction="column"
                  gap="3"
                >
                  <Text size="1" color="gray">
                    Waiting for bot to be added, refreshing on 5 second
                    intervals.
                  </Text>
                  <BarLoader color="#8884d8" width={200} />
                </Flex>
                <Text size="1" color="gray">
                  Make sure to have all permissions checked, or we won&apos;t be
                  able to detect the bot being added.
                </Text>
              </Flex>
            </>
          )}
          {dialogPage === 2 && params.serviceType === 'discord' && (
            <SetupDiscordUserRolesSelection
              accessType={params.accessType}
              companyId={params.companyId}
              serviceId={params.serviceId}
              serviceType={params.serviceType}
              refreshServiceData={refreshServiceData}
            />
          )}
          {dialogPage === 3 && params.serviceType === 'discord' && (
            <SetupDiscordMainChannelSelection
              accessType={params.accessType}
              companyId={params.companyId}
              serviceId={params.serviceId}
              serviceType={params.serviceType}
              refreshServiceData={refreshServiceData}
            />
          )}
          {dialogPage === 4 && params.serviceType === 'discord' && (
            <SetupDiscordLogChannelSelection
              accessType={params.accessType}
              companyId={params.companyId}
              serviceId={params.serviceId}
              serviceType={params.serviceType}
              refreshServiceData={refreshServiceData}
            />
          )}
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
