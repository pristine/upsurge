import { setChannel as setMainChannel } from '@/services/service';
import { type ApiResponse } from '@/types/response';
import { type Service } from '@/types/service';
import { type Channel } from '@/types/discord';
import { Flex, Card, Inset, Button, Text } from 'frosted-ui';
import { useState } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { type KeyedMutator } from 'swr';

export default function DiscordMainChannelBody({
  accessType,
  serviceId,
  serviceType,
  companyId,
  refreshServiceData,
  channelData,
  isSettings,
  type,
}: {
  accessType: 'whop' | 'web';
  serviceType: string;
  serviceId: string;
  companyId: string;
  refreshServiceData: KeyedMutator<ApiResponse<Service>>;
  channelData: ApiResponse<Channel[]>;
  isSettings?: boolean;
  type: 'logChannel' | 'mainChannel';
}) {
  const [currentChannel, setChannel] = useState('');
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
                  Channel name
                </Text>
              </div>
              <div className="col-span-1">
                <Text size="2" weight="bold">
                  Channel ID
                </Text>
              </div>
            </div>
          </Flex>
          <AutoSizer disableHeight>
            {({ width }) => (
              <List
                width={width} // or the width of your container
                height={180} // or the height of your container
                rowCount={channelData.data?.length ?? 0}
                rowHeight={40} // or the height of your rows
                rowRenderer={({ index, key, style }) => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  const channel = channelData.data![index];
                  return (
                    <div
                      key={key}
                      style={style}
                      onClick={() => {
                        if (currentChannel === channel.id) {
                          setChannel('');
                        } else {
                          setChannel(channel.id);
                        }
                      }}
                      className={`grid grid-cols-3 gap-4 w-full border-b-[1px] border-gray-6 py-2 px-4 hover:cursor-pointer ${
                        currentChannel === channel.id
                          ? 'bg-indigo-5'
                          : 'hover:bg-gray-2'
                      }`}
                    >
                      <div className="col-span-2 truncate">
                        <Text size="1">{channel.name}</Text>
                      </div>
                      <div className="col-span-1 truncate">
                        <Text size="1">{channel.id}</Text>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </AutoSizer>
        </Inset>
      </Card>
      <Flex gap="2" direction="column">
        {!isSettings && (
          <Text size="1" color="gray">
            Planning on changing the main channel in the future? You can always
            do so in the service settings.
          </Text>
        )}
        <Text size="1" color="gray" weight="bold">
          Channel not showing up? Make sure the Upserge discord bot can
          read/send/manage messages and add reactions in your desired
          channel(s).
        </Text>
      </Flex>
      <Flex gap="3" justify="end" mt="4">
        <Button
          className="hover:cursor-pointer"
          color="success"
          onClick={async () => {
            setIsSuccessLoading(true);
            await setMainChannel(
              accessType,
              companyId,
              serviceType,
              serviceId,
              type,
              currentChannel
            );
            await refreshServiceData();
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
