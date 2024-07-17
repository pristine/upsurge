import { setUserRoles } from '@/services/service';
import { type Role } from '@/types/discord';
import { type Service } from '@/types/service';
import { type ApiResponse } from '@/types/response';
import { Flex, Card, Inset, Button, Text } from 'frosted-ui';
import { useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { type KeyedMutator, useSWRConfig } from 'swr';

export default function DiscordUserRolesBody({
  accessType,
  serviceId,
  serviceType,
  companyId,
  refreshServiceData,
  rolesData,
  isSettings,
}: {
  accessType: 'whop' | 'web';
  serviceType: string;
  serviceId: string;
  companyId: string;
  refreshServiceData: KeyedMutator<ApiResponse<Service>>;
  rolesData: ApiResponse<{
    roles: Role[];
    currentRoles: string[];
  }>;
  isSettings?: boolean;
}) {
  const { mutate } = useSWRConfig();

  const [currentRoles, setCurrentRoles] = useState(
    rolesData.data?.currentRoles ?? ([] as string[])
  );
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);

  return (
    <Flex className="h-full" direction="column" gap="3">
      <Card className="w-full">
        <Inset clip="border-box" side="all">
          <Flex
            direction="row"
            className="w-full bg-gray-3 border-b-[1px] border-gray-6"
            py="3"
          >
            <div className="grid grid-cols-3 gap-4 w-full px-4">
              <div className="col-span-2">
                <Text size="2" weight="bold">
                  Role name
                </Text>
              </div>
              <div className="col-span-1">
                <Text size="2" weight="bold">
                  Role ID
                </Text>
              </div>
            </div>
          </Flex>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width} // or the width of your container
                height={180} // or the height of your container
                rowCount={rolesData.data?.roles.length ?? 0}
                rowHeight={40} // or the height of your rows
                rowRenderer={({ index, key, style }) => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const roleData = rolesData.data!.roles[index];
                  return (
                    <div
                      key={key}
                      style={style}
                      onClick={() => {
                        if (currentRoles.includes(roleData.id)) {
                          setCurrentRoles(
                            currentRoles.filter((role) => role !== roleData.id)
                          );
                        } else {
                          setCurrentRoles([...currentRoles, roleData.id]);
                        }
                      }}
                      className={`grid grid-cols-3 gap-4 w-full border-b-[1px] border-gray-6 py-2 px-4 hover:cursor-pointer ${
                        currentRoles.includes(roleData.id)
                          ? 'bg-indigo-5'
                          : 'hover:bg-gray-2'
                      }`}
                    >
                      <div className="col-span-2 truncate">
                        <Text size="1">{roleData.name}</Text>
                      </div>
                      <div className="col-span-1 truncate">
                        <Text size="1">{roleData.id}</Text>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </AutoSizer>
        </Inset>
      </Card>
      <Text size="1" color="gray">
        Just a heads up! You can select @everyone, or none at all, for any role.
      </Text>
      {!isSettings && (
        <Text size="1" color="gray">
          Adding more roles in the future? You can always change this in the
          service settings.
        </Text>
      )}
      <Flex gap="3" justify="end" mt="4">
        <Button
          className="hover:cursor-pointer"
          color="success"
          onClick={async () => {
            setIsSuccessLoading(true);
            await setUserRoles(
              accessType,
              companyId,
              serviceType,
              serviceId,
              currentRoles
            );
            await refreshServiceData();
            await mutate(
              `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users`
            );
            await mutate(
              `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users/top`
            );
            setIsSuccessLoading(false);
          }}
          loading={isSuccessLoading}
        >
          Update
        </Button>
      </Flex>
    </Flex>
  );
}
