'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import DashboardIcon from '@/components/icons/dashboard';
import RewardsIcon from '@/components/icons/rewards';
import UsersIcon from '@/components/icons/users';
import AutomationsIcon from '@/components/icons/automations';
import React, { useState } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Button,
  Card,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Flex,
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  IconButton,
} from 'frosted-ui';
import { ChevronRightIcon } from '@heroicons/react/16/solid';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import DiscordUserRolesBody from '../service/DiscordRoles';
import { type Channel, type Role } from '@/types/discord';
import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import useSWR, { useSWRConfig } from 'swr';
import DiscordMainChannelBody from '../service/DiscordChannel';
import { type Company } from '@/types/company';
import { deleteMainService } from '@/services/company';

interface NavBarProps {
  companyId: string;
  serviceId: string;
  serviceType: string;
  serviceName: string;
  accessType: 'whop' | 'web';
}

export default function NavBar({
  companyId,
  serviceId,
  serviceType,
  serviceName,
  accessType,
}: NavBarProps) {
  const router = useRouter();

  const { mutate } = useSWRConfig();

  const [isChangeServiceLoading, setIsChangeServiceLoading] = useState(false);

  const { data: companyData } = useSWR<ApiResponse<Company>>(
    `/${accessType}/api/company/${companyId}`,
    fetcher
  );

  const { data: rolesData, mutate: refreshRolesData } = useSWR<
    ApiResponse<{
      roles: Role[];
      currentRoles: string[];
    }>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/roles`,
    fetcher
  );

  const { data: channelData, mutate: refreshChannelData } = useSWR<
    ApiResponse<Channel[]>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/channel`,
    fetcher
  );

  const pathname = usePathname();

  const tabs = [
    {
      name: 'Dashboard',
      href: `/${accessType}/company/${companyId}/${serviceType}/${serviceId}`,
      icon: <DashboardIcon />,
    },
    {
      name: 'Users',
      href: `/${accessType}/company/${companyId}/${serviceType}/${serviceId}/users`,
      icon: <UsersIcon />,
    },
    {
      name: 'Rewards',
      href: `/${accessType}/company/${companyId}/${serviceType}/${serviceId}/rewards`,
      icon: <RewardsIcon />,
    },
  ];

  if (companyData?.data?.automations) {
    tabs.push({
      name: 'Automations',
      href: `/${accessType}/company/${companyId}/${serviceType}/${serviceId}/automations`,
      icon: <AutomationsIcon />,
    });
  }

  return (
    <div className="flex flex-row w-full bg-gray-2 rounded-lg px-4 py-4 gap-5 items-center justify-between shadow-sm">
      <div className="flex flex-row gap-5 items-center">
        {/* <h1 className="text-xl font-bold truncate">{groupName}</h1> */}
        <HoverCardRoot>
          <HoverCardTrigger>
            <h1 className="text-xl font-bold truncate">{serviceName}</h1>
          </HoverCardTrigger>
          <HoverCardContent size="2"></HoverCardContent>
        </HoverCardRoot>
        <div className="flex flex-row gap-2 items-center justify-center">
          {tabs.map((link) => {
            const isActive =
              pathname.toLowerCase() ===
              link.href.toLowerCase().replace(/\/$/, '');

            return (
              <Link
                className={`flex flex-row px-3 py-2 gap-2 rounded-lg text-[14px] ${
                  isActive
                    ? 'bg-blue-a3 text-[#006AFF] font-bold'
                    : 'hover:bg-gray-5 text-[#585874]'
                }`}
                href={link.href}
                key={link.name}
              >
                {React.cloneElement(link.icon, {
                  innerFill: isActive ? '#006AFF' : null,
                })}
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
      <Flex direction="row" gap="4" justify="center" align="center">
        <DialogRoot
          onOpenChange={async (open) => {
            if (open) {
              await refreshRolesData();
              await refreshChannelData();
            }
          }}
        >
          <DialogTrigger>
            <IconButton
              size="2"
              variant="ghost"
              className="hover:cursor-pointer"
            >
              <Cog8ToothIcon color="#8B8BA7" height={20} width={20} />
            </IconButton>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Update settings.</DialogDescription>
            <Flex direction="column" gap="4" className="w-full">
              <AccordionRoot
                type="single"
                className="w-full"
                collapsible={true}
              >
                <Flex direction="column" gap="4" className="w-full">
                  <AccordionItem value="update-roles">
                    <AccordionTrigger>Update User Roles</AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <DiscordUserRolesBody
                          accessType={accessType}
                          companyId={companyId}
                          refreshServiceData={async (): Promise<undefined> => {}}
                          rolesData={rolesData ?? { success: true }}
                          serviceId={serviceId}
                          serviceType={serviceType}
                          isSettings={true}
                        />
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="update-main-channel" className="w-full">
                    <AccordionTrigger>Update Main Channel</AccordionTrigger>
                    <AccordionContent className="w-full">
                      <Card className="w-full">
                        <DiscordMainChannelBody
                          accessType={accessType}
                          companyId={companyId}
                          refreshServiceData={async (): Promise<undefined> => {}}
                          channelData={
                            channelData ?? { success: true, data: [] }
                          }
                          serviceId={serviceId}
                          serviceType={serviceType}
                          isSettings={true}
                          type="mainChannel"
                        />
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="update-log-channel" className="w-full">
                    <AccordionTrigger>Update Log Channel</AccordionTrigger>
                    <AccordionContent className="w-full">
                      <Card className="w-full">
                        <DiscordMainChannelBody
                          accessType={accessType}
                          companyId={companyId}
                          refreshServiceData={async (): Promise<undefined> => {}}
                          channelData={
                            channelData ?? { success: true, data: [] }
                          }
                          serviceId={serviceId}
                          serviceType={serviceType}
                          isSettings={true}
                          type="logChannel"
                        />
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Flex>
              </AccordionRoot>
            </Flex>
          </DialogContent>
        </DialogRoot>
        <Button
          onClick={async () => {
            setIsChangeServiceLoading(true);
            await deleteMainService(accessType, companyId);
            await mutate(`/${accessType}/api/company/${companyId}`);
            setIsChangeServiceLoading(false);
            router.push(`/${accessType}/company/${companyId}`);
          }}
          loading={isChangeServiceLoading}
          size="2"
          color="gray"
          className="hover:cursor-pointer hover:scale-105"
          // className="hover:cursor-pointer flex flex-row gap-2 rounded-lg border-gray-5 border-[1px] px-3 py-2 text-[14px] hover:scale-105 justify-center items-center"
        >
          Change Service
          <ChevronRightIcon width={20} height={20} />
        </Button>
      </Flex>
    </div>
  );
}
