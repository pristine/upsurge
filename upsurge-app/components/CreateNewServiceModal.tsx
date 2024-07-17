'use client';

import { deleteDiscord } from '@/services/discord';
import { addDiscordService } from '@/services/service';
import { type Discord } from '@/types/discord';
import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import {
  Button,
  Card,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Flex,
  Inset,
  Link,
  Text,
} from 'frosted-ui';
import {
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
  useRef,
} from 'react';
import { ClipLoader } from 'react-spinners';
import { AutoSizer, List } from 'react-virtualized';
import useSWR, { type KeyedMutator } from 'swr';

interface Props {
  accessType: 'whop' | 'web';
  companyId: string;
  refreshServices: Function;
}

function ServiceCard({
  isDisabled = false,
  service,
  onClick,
}: {
  service: string;
  isDisabled: boolean;
  onClick: Function;
}) {
  return (
    <Flex
      justify="center"
      align="center"
      style={{ boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.2)' }}
      onClick={() => {
        if (!isDisabled) onClick();
      }}
      className={`w-full h-full py-4 px-8 hover:${
        !isDisabled ? 'cursor-pointer' : 'cursor-wait'
      } ${isDisabled && 'bg-gray-5'} ${
        !isDisabled && 'hover:bg-gray-2 hover:scale-105'
      } border-[1px] rounded-lg border-gray-8`}
    >
      {service}
    </Flex>
  );
}

function ServicePage({
  setPage,
  setService,
}: {
  setPage: Dispatch<SetStateAction<number>>;
  setService: Dispatch<SetStateAction<string>>;
}) {
  return (
    <Flex justify="center" direction="row" gap="4">
      <ServiceCard
        isDisabled={false}
        service="Discord"
        onClick={() => {
          setService('discord');
          setPage(2);
        }}
      />
      <ServiceCard
        service="Telegram (coming soon)"
        isDisabled={true}
        onClick={() => {
          setService('telegram');
          setPage(2);
        }}
      />
    </Flex>
  );
}

function DiscordAuthPage({
  setPage,
  service,
  authenticationPageUrl,
}: {
  setPage: Dispatch<SetStateAction<number>>;
  service: string;
  authenticationPageUrl: string;
}) {
  return (
    <Flex
      className="w-full"
      justify="center"
      align="center"
      direction="column"
      gap="1"
    >
      <ClipLoader color="#8884d8" />
      <Text mt="2">Waiting for Discord authentication...</Text>
      <Text size="1" color="gray">
        If a page has not opened, click{' '}
        <Link href={authenticationPageUrl} target="_blank">
          here to open
        </Link>{' '}
        or{' '}
        <Text
          color="purple"
          className="hover:cursor-pointer"
          onClick={async () => {
            await navigator.clipboard.writeText(authenticationPageUrl);
          }}
        >
          here to copy
        </Text>
        .
      </Text>
      <Text size="1" color="gray">
        If stuck on this screen, refresh the page.
      </Text>
    </Flex>
  );
}

function SetupDiscordGuildSelection({
  accessType,
  guilds,
  guild,
  setGuild,
  refreshDiscordData,
}: {
  accessType: 'whop' | 'web';
  guilds: Discord['guilds'];
  guild: string;
  setGuild: Dispatch<SetStateAction<string>>;
  refreshDiscordData: KeyedMutator<ApiResponse<Discord>>;
}) {
  return (
    <>
      <DialogTitle>Server Selection</DialogTitle>
      <DialogDescription>Choose a server to proceed with.</DialogDescription>
      <Flex className="h-full" direction="column" gap="3">
        {/* <SelectRoot>
          <SelectTrigger
            className="w-full ignore-ref"
            placeholder="Select a server..."
          />
          <SelectContent className="ignore-ref">
            {guilds.map((guild) => (
              <SelectItem value={guild.id}>{guild.name}</SelectItem>
            ))}
          </SelectContent>
        </SelectRoot> */}
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
                    Server name
                  </Text>
                </div>
                <div className="col-span-1">
                  <Text size="2" weight="bold">
                    Server ID
                  </Text>
                </div>
              </div>
            </Flex>
            <AutoSizer disableHeight>
              {({ width }) => (
                <List
                  width={width} // or the width of your container
                  height={180} // or the height of your container
                  rowCount={guilds.length}
                  rowHeight={40} // or the height of your rows
                  rowRenderer={({ index, key, style }) => {
                    const guildData = guilds[index];
                    return (
                      <div
                        key={key}
                        style={style}
                        onClick={() => {
                          if (guild === guildData.id) setGuild('');
                          else setGuild(guildData.id);
                        }}
                        className={`grid grid-cols-3 gap-4 w-full border-b-[1px] border-gray-6 py-2 px-4 hover:cursor-pointer ${
                          guild === guildData.id
                            ? 'bg-indigo-5'
                            : 'hover:bg-gray-2'
                        }`}
                      >
                        <div className="col-span-2 truncate">
                          <Text size="1">{guildData.name}</Text>
                        </div>
                        <div className="col-span-1 truncate">
                          <Text size="1">{guildData.id}</Text>
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
          Wrong Discord account or servers not showing up? Click{' '}
          <Text
            onClick={async () => {
              await deleteDiscord(accessType);
              await refreshDiscordData();
            }}
            color="purple"
            className="hover:cursor-pointer"
          >
            here
          </Text>{' '}
          to relink your account.
        </Text>
      </Flex>
    </>
  );
}

export default function CreateNewServiceModal({
  accessType,
  companyId,
  refreshServices,
}: Props) {
  const {
    data: discordData,
    isLoading: isDiscordDataLoading,
    mutate: refreshDiscordData,
  } = useSWR<ApiResponse<Discord>>(`/${accessType}/api/discord`, fetcher);

  const [page, setPage] = useState(1);
  const [service, setService] = useState('');
  const [guild, setGuild] = useState('');
  const [discordAuthenticationPage, setDiscordAuthenticationPage] =
    useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false);

  const dialogRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        dialogRef.current &&
        !(dialogRef.current as any).contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dialogRef]);

  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setService('');
      setGuild('');
      setDiscordAuthenticationPage('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      discordData?.data &&
      page === 2 &&
      service === 'discord' &&
      !discordData.data.isValid
    ) {
      const authPage = `${discordData.data.oauthUrl}&state=${discordData.data.userId}`;
      window.open(authPage, '_blank');
      setDiscordAuthenticationPage(authPage);
    }
  }, [page, discordData?.data?.isValid]);

  return (
    <DialogRoot open={isOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent ref={dialogRef}>
        {isDiscordDataLoading ? (
          <Flex className="w-full" justify="center" align="center">
            <ClipLoader color="#8884d8" />
          </Flex>
        ) : (
          (() => {
            if (page === 1) {
              return (
                <>
                  <DialogTitle>Service Selection</DialogTitle>
                  <DialogDescription>
                    Choose a service to proceed with.
                  </DialogDescription>
                  <ServicePage setPage={setPage} setService={setService} />
                </>
              );
            } else if (
              discordData?.data &&
              page === 2 &&
              service === 'discord' &&
              !discordData.data.isValid
            )
              return (
                <DiscordAuthPage
                  authenticationPageUrl={discordAuthenticationPage}
                  setPage={setPage}
                  service={service}
                />
              );
            else if (
              discordData?.data &&
              page === 2 &&
              discordData.data.isValid
            ) {
              return (
                <SetupDiscordGuildSelection
                  accessType={accessType}
                  guilds={discordData.data.guilds}
                  setGuild={setGuild}
                  guild={guild}
                  refreshDiscordData={refreshDiscordData}
                />
              );
            }

            return <Text>Invalid page</Text>;
          })()
        )}
        {guild.length > 0 && (
          <Flex gap="3" justify="end" mt="4">
            <Button
              className="hover:cursor-pointer"
              color="gray"
              onClick={() => {
                setIsOpen(false);
              }}
              variant="soft"
            >
              Cancel
            </Button>
            <Button
              className="hover:cursor-pointer"
              color="success"
              onClick={async () => {
                setIsSuccessLoading(true);
                await addDiscordService(accessType, companyId, guild);
                await refreshServices();
                setIsSuccessLoading(false);
                setIsOpen(false);
              }}
              loading={isSuccessLoading}
            >
              Setup
            </Button>
          </Flex>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
