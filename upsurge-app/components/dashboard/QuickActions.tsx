import {
  Button,
  CalloutIcon,
  CalloutRoot,
  CalloutText,
  Card,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Flex,
  Grid,
  Inset,
  Strong,
  Text,
  TextArea,
  TextFieldInput,
  TextFieldRoot,
  TextFieldSlot,
  Tooltip,
} from 'frosted-ui';
import React, {
  type FC,
  type PropsWithChildren,
  useRef,
  useState,
  type MouseEvent,
  useEffect,
} from 'react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import {
  TrophyIcon,
  XMarkIcon,
  GiftIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import { userSearch } from '@/services/user';
import { BarLoader } from 'react-spinners';
import { List, AutoSizer } from 'react-virtualized';
import { updatePoints } from '@/services/points';
import { mutate } from 'swr';
import { addReward } from '@/services/rewards';
import { type User } from '@/types/users';
import Image from 'next/image';

interface ActionButtonProps extends PropsWithChildren<{}> {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

const ActionButton: FC<ActionButtonProps> = ({ children, ...props }) => {
  return (
    <button
      className="items-center justify-center text-center hover:bg-gray-2 hover:scale-105 pl-6 pr-3 py-3 border rounded-lg border-gray-10 text-3 flex flex-row gap-6"
      {...props}
    >
      {children}
    </button>
  );
};

function PointsAction({
  companyId,
  serviceId,
  serviceType,
  mode,
  filter,
  accessType,
}: {
  accessType: 'whop' | 'web';
  companyId: string;
  serviceId: string;
  serviceType: string;
  filter: string;
  mode: 'GIVE' | 'DEDUCT';
}) {
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [users, setUsers] = useState([] as User[]);
  const [points, setPoints] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dialogRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        dialogRef.current &&
        !(dialogRef.current as any).contains(event.target)
      ) {
        setIsDialogOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dialogRef]);

  const debouncedSearchTerm = debounce(async (searchTerm: string) => {
    setIsSearching(true);
    try {
      const data = await userSearch(
        accessType,
        companyId,
        serviceType,
        serviceId,
        searchTerm
      );

      setUsers(data.data);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.error(`User search error: ${e}`);
    }
    setIsSearching(false);
  }, 500); // delay in ms

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(false);
      void debouncedSearchTerm(searchTerm);
      setSelectedUserId('');
    }
  }, [searchTerm]);

  return (
    <DialogRoot open={isDialogOpen}>
      <DialogTrigger>
        <ActionButton
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          <Flex justify="center" gap="9" align="center">
            <Flex gap="4">
              {mode === 'GIVE' ? (
                <TrophyIcon className="h-5 w-5" />
              ) : (
                <XMarkIcon className="h-6 w-6" />
              )}
              {mode === 'GIVE'
                ? 'Give points to a user'
                : 'Deduct points from a user'}
            </Flex>
            <ChevronRightIcon className="h-8 w-8" />
          </Flex>
        </ActionButton>
      </DialogTrigger>
      <DialogContent ref={dialogRef}>
        <DialogTitle>
          {mode === 'GIVE'
            ? 'Give points to a user'
            : 'Deduct points from a user'}
        </DialogTitle>
        {selectedUserId.length > 0 ? (
          <DialogDescription>Selected user: {selectedUserId}</DialogDescription>
        ) : (
          users.length > 0 && (
            <DialogDescription>
              {mode === 'GIVE'
                ? 'Select a user to give points to'
                : 'Select a user to deduct points from'}
            </DialogDescription>
          )
        )}
        <Flex direction="column" gap="3">
          <label>
            <TextFieldRoot color="gray" size="2" variant="surface">
              <TextFieldSlot>
                <MagnifyingGlassIcon className="h-5 w-5" />
              </TextFieldSlot>
              <TextFieldInput
                size="3"
                placeholder="Search for user(s)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
              />
            </TextFieldRoot>
          </label>

          {isSearching ? (
            <Card>
              <Flex justify="center" align="center" className="h-full">
                <BarLoader color="#8884d8" width={200} />
              </Flex>
            </Card>
          ) : users.length === 0 ? (
            <Card>
              <Flex justify="center" align="center" className="h-full">
                <CalloutRoot variant="soft">
                  <CalloutIcon>i</CalloutIcon>
                  <CalloutText>No users found.</CalloutText>
                </CalloutRoot>
              </Flex>
            </Card>
          ) : (
            <Card className="w-full">
              <Inset clip="border-box" side="all">
                <Flex
                  direction="row"
                  className="w-full bg-gray-3 border-b-[1px] border-gray-6"
                  py="3"
                >
                  <div className="grid grid-cols-6 gap-4 w-full px-4">
                    <div className="col-span-1">
                      <Text size="2">
                        <Strong>Profile</Strong>
                      </Text>
                    </div>
                    <div className="col-span-2">
                      <Text size="2">
                        <Strong>Username</Strong>
                      </Text>
                    </div>
                    <div className="col-span-2">
                      <Text size="2">
                        <Strong>User ID</Strong>
                      </Text>
                    </div>
                    <div className="col-span-1">
                      <Text size="2">
                        <Strong>Points</Strong>
                      </Text>
                    </div>
                  </div>
                </Flex>
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width} // or the width of your container
                      height={180} // or the height of your container
                      rowCount={users.length}
                      rowHeight={40} // or the height of your rows
                      rowRenderer={({ index, key, style }) => {
                        const user = users[index];
                        return (
                          <div
                            key={key}
                            style={style}
                            onClick={() => {
                              if (selectedUserId === user.id)
                                setSelectedUserId('');
                              else setSelectedUserId(user.id);
                            }}
                            className={`grid grid-cols-6 gap-4 w-full border-b-[1px] border-gray-6 pt-2 px-4 hover:cursor-pointer ${
                              selectedUserId === user.id
                                ? 'bg-indigo-5'
                                : 'hover:bg-gray-3'
                            }`}
                          >
                            <div className="col-span-1 truncate">
                              <Image
                                src={
                                  user.profilePicUrl ??
                                  'https://media.discordapp.net/attachments/715592184690376754/1187541146877034516/Group_37002.png?ex=659742e0&is=6584cde0&hm=91534638c5f77d8ff40e6ca40a02d0af87066afd79e91d55cdfcac6d1a40b145&=&format=webp&quality=lossless'
                                }
                                alt={user.id}
                                className="rounded-full"
                                width={25}
                                height={25}
                              />
                            </div>
                            <Tooltip content={user.username}>
                              <div className="col-span-2 truncate">
                                <Text size="1">{user.username}</Text>
                              </div>
                            </Tooltip>
                            <Tooltip content={user.id}>
                              <div className="col-span-2 truncate">
                                <Text size="1">{user.id}</Text>
                              </div>
                            </Tooltip>
                            <Tooltip content={user.points.toLocaleString()}>
                              <div className="col-span-1 truncate">
                                <Text size="1">
                                  {user.points.toLocaleString()}
                                </Text>
                              </div>
                            </Tooltip>
                          </div>
                        );
                      }}
                    />
                  )}
                </AutoSizer>
              </Inset>
            </Card>
          )}
        </Flex>
        {selectedUserId.length > 0 && (
          <Flex mt="4" className="w-full">
            <label>
              <TextFieldRoot
                color="gray"
                size="2"
                variant="surface"
                className="w-full"
              >
                <TextFieldInput
                  size="2"
                  placeholder="Points"
                  type="number"
                  value={points}
                  onChange={(e) => {
                    setPoints(parseInt(e.target.value));
                  }}
                />
              </TextFieldRoot>
            </label>
          </Flex>
        )}
        <Flex gap="3" justify="end" mt="4">
          <Button
            className="hover:cursor-pointer"
            color="gray"
            onClick={() => {
              setIsDialogOpen(false);
            }}
            variant="soft"
          >
            Cancel
          </Button>
          <Button
            className="hover:cursor-pointer"
            color="success"
            onClick={async () => {
              if (selectedUserId.length === 0) {
                // toast.error('You must select a product!');
                return;
              }

              setIsButtonLoading(true);
              await updatePoints(
                accessType,
                companyId,
                serviceType,
                serviceId,
                selectedUserId,
                points,
                mode === 'GIVE' ? 'add' : 'subtract'
              );
              void mutate(
                `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/points/distribution?timeframe=${filter}`
              );
              void mutate(
                `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users/top`
              );
              setPoints(1);
              setUsers([]);
              setSearchTerm('');
              setIsButtonLoading(false);
              setIsDialogOpen(false);
            }}
            disabled={!selectedUserId}
            loading={isButtonLoading}
          >
            {mode === 'GIVE' ? 'Give' : 'Deduct'}
          </Button>
        </Flex>
      </DialogContent>
    </DialogRoot>
  );
}

export function AddReward({
  accessType,
  companyId,
  serviceId,
  serviceType,
}: {
  accessType: 'whop' | 'web';
  companyId: string;
  serviceId: string;
  serviceType: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(1);

  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dialogRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        dialogRef.current &&
        !(dialogRef.current as any).contains(event.target)
      ) {
        setIsDialogOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dialogRef]);

  return (
    <DialogRoot open={isDialogOpen}>
      <DialogTrigger>
        <ActionButton
          onClick={() => {
            setIsDialogOpen(true);
          }}
        >
          <Flex justify="center" gap="9" align="center">
            <Flex gap="4" justify="center" align="center">
              <GiftIcon className="h-6 w-6" /> Add a new reward
            </Flex>
            <ChevronRightIcon className="h-8 w-8" />
          </Flex>
        </ActionButton>
      </DialogTrigger>
      <DialogContent ref={dialogRef}>
        <DialogTitle>Add a new reward</DialogTitle>
        <DialogDescription>
          Fill out the following fields to add a reward.
        </DialogDescription>
        <Flex mt="4" gap="4" direction="column" className="w-full">
          <Grid gap="1" className="w-full">
            <Text as="div" mb="1" size="2" weight="bold">
              Nickname
            </Text>
            <TextFieldRoot
              color="gray"
              size="2"
              variant="surface"
              className="w-full"
            >
              <TextFieldInput
                size="2"
                placeholder="Max of 100 characters"
                value={title}
                maxLength={100}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </TextFieldRoot>
          </Grid>
          <Grid gap="1" className="w-full">
            <Text as="div" mb="1" size="2" weight="bold">
              Description
            </Text>
            <TextArea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder="Reward description..."
            />
          </Grid>
          <Grid gap="1" className="w-full">
            <Text as="div" mb="1" size="2" weight="bold">
              Points Required
            </Text>
            <TextFieldRoot
              color="gray"
              size="2"
              variant="surface"
              className="w-full"
            >
              <TextFieldInput
                size="2"
                value={points}
                type="number"
                onChange={(e) => {
                  setPoints(parseInt(e.target.value));
                }}
              />
            </TextFieldRoot>
          </Grid>
        </Flex>
        <Flex justify="end" direction="row" mt="4" gap="3">
          <Button
            className="hover:cursor-pointer"
            color="gray"
            onClick={() => {
              setIsDialogOpen(false);
            }}
            variant="soft"
          >
            Cancel
          </Button>
          <Button
            className="hover:cursor-pointer"
            color="success"
            onClick={async () => {
              if (title.length === 0) {
                // toast.error('You must select a product!');
                return;
              }

              setIsButtonLoading(true);
              await addReward(
                accessType,
                companyId,
                serviceType,
                serviceId,
                title,
                description,
                points
              );

              setIsButtonLoading(false);

              setTitle('');
              setDescription('');
              setPoints(1);
              setIsDialogOpen(false);
            }}
            disabled={!title || !description}
            loading={isButtonLoading}
          >
            Add
          </Button>
        </Flex>
      </DialogContent>
    </DialogRoot>
  );
}

export default function QuickActions({
  accessType,
  companyId,
  serviceId,
  serviceType,
  filter,
}: {
  accessType: 'whop' | 'web';
  companyId: string;
  serviceId: string;
  serviceType: string;
  filter: string;
}) {
  return (
    <Flex className="flex flex-col rounded-lg px-6 pt-4 pb-6 shadow w-full bg-gray-2">
      <Flex className="flex flex-row gap-6">
        <h1 className="font-bold text-[20px]">Quick Actions</h1>
      </Flex>
      <Flex direction="row" gap="6" className="py-4">
        <PointsAction
          accessType={accessType}
          mode="GIVE"
          companyId={companyId}
          serviceId={serviceId}
          serviceType={serviceType}
          filter={filter}
        />
        <PointsAction
          accessType={accessType}
          mode="DEDUCT"
          companyId={companyId}
          serviceId={serviceId}
          serviceType={serviceType}
          filter={filter}
        />
        <AddReward
          accessType={accessType}
          companyId={companyId}
          serviceId={serviceId}
          serviceType={serviceType}
        />
      </Flex>
    </Flex>
  );
}
