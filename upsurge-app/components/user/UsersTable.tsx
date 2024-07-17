'use client';

import { type ApiResponse } from '@/types/response';
import { type User } from '@/types/users';
import { fetcher } from '@/util/swr';
import { useDebounce } from '@uidotdev/usehooks';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import {
  Flex,
  TextFieldRoot,
  TextFieldSlot,
  TextFieldInput,
  Card,
  Inset,
  Text,
  Avatar,
  Box,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Tooltip,
  SkeletonText,
  SkeletonAvatar,
  Code,
  Button,
  Separator,
} from 'frosted-ui';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import useSWR from 'swr';
import Pagination from '../Pagination';
import FilterAndSort from '../FilterAndSort';
import { updatePoints } from '@/services/points';
import { useRouter } from 'next/navigation';

function TableSkeleton() {
  return (
    <Flex className="w-full h-[530px]" direction="column">
      {Array(10)
        .fill(null)
        .map((_, index) => (
          <div
            key={`pl-users-table-${index}`}
            onClick={() => {}}
            className={`grid grid-cols-8 gap-8 w-full ${
              index !== 9 && 'border-b-[1px] border-gray-6'
            } py-2 px-4 items-center justify-center h-[53px]`}
          >
            <div className="col-span-2">
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 175,
                }}
              />
            </div>
            <div className="col-span-3">
              <Flex align="center" direction="row" gap="4">
                <SkeletonAvatar color="gray" size="2" />
                <Flex direction="column">
                  <SkeletonText
                    size="1"
                    color="gray"
                    style={{
                      width: 150,
                    }}
                  />
                  <SkeletonText
                    size="1"
                    color="gray"
                    style={{
                      width: 100,
                    }}
                  />
                </Flex>
              </Flex>
            </div>
            <div className="col-span-1">
              <SkeletonText
                color="gray"
                style={{
                  width: 25,
                }}
              />
            </div>
            <div className="col-span-1">
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 25,
                }}
              />
            </div>
            <div className="col-span-1">
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 25,
                }}
              />
            </div>
          </div>
        ))}
    </Flex>
  );
}

export default function UsersTable({
  accessType,
  companyId,
  serviceType,
  serviceId,
}: {
  accessType: 'whop' | 'web';
  companyId: string;
  serviceType: string;
  serviceId: string;
}) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('none');

  const [currentOpenUserId, setCurrentOpenUserId] = useState('');
  const [currentUserPoints, setCurrentUserPoints] = useState(0);
  const [isCurrentUserUpdating, setIsCurrentUserUpdating] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: searchUsers,
    isLoading: isSearchUsersLoading,
    mutate: searchUsersMutate,
  } = useSWR<
    ApiResponse<{
      users: User[];
      totalPages: number;
      perPage: number;
      totalUsers: number;
    }>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users/search?page=${page}&term=${debouncedSearchTerm}&sortBy=${sortBy}`,
    fetcher
  );

  const { data: users } = useSWR<
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

  const {
    data: currentUser,
    isLoading: isCurrentUserLoading,
    mutate: currentUserMutate,
  } = useSWR<ApiResponse<User>>(
    currentOpenUserId
      ? `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/users/${currentOpenUserId}`
      : null,
    fetcher
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    setCurrentUserPoints(0);
  }, [currentOpenUserId]);

  useEffect(() => {
    if (currentUser?.data) {
      setCurrentUserPoints(currentUser.data.points);
    }
  }, [currentUser]);

  return (
    <Flex
      className="w-full bg-gray-2 rounded-lg px-6 py-6 gap-4"
      direction="column"
    >
      <Flex align="center" gap="4">
        <Text size="2" color="gray">
          Total Users: {users?.data?.totalUsers ?? 0}
        </Text>
        <Text size="2" color="gray">
          Users in Search: {searchUsers?.data?.totalUsers ?? 0}
        </Text>
      </Flex>

      <Flex className="w-full" direction="row" gap="4">
        <TextFieldRoot
          color="gray"
          size="2"
          variant="surface"
          className="w-full"
        >
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
            className="w-full"
          />
        </TextFieldRoot>
        <FilterAndSort
          setSortBy={setSortBy}
          sortBy={sortBy}
          sort={[
            {
              display: 'Points',
              value: 'points',
            },
            {
              display: 'Total Points',
              value: 'totalPoints',
            },
            {
              display: 'Rewards Redeemed',
              value: 'rewardsRedeemed',
            },
          ]}
        />
      </Flex>
      <Card className="w-full">
        <Inset clip="border-box" side="all">
          <Flex
            direction="row"
            className="w-full bg-gray-3 border-b-[1px] border-gray-6"
            py="3"
          >
            <div className="grid grid-cols-8 gap-8 w-full px-4">
              <div className="col-span-2">
                <Text size="2" weight="bold" color="gray">
                  ID
                </Text>
              </div>
              <div className="col-span-3">
                <Text size="2" weight="bold" color="gray">
                  User
                </Text>
              </div>
              <div className="col-span-1">
                <Tooltip content="Current number of points.">
                  <Text size="2" weight="bold" color="gray">
                    Points
                  </Text>
                </Tooltip>
              </div>
              <div className="col-span-1">
                <Tooltip content="Total amount of points earned lifetime.">
                  <Text size="2" weight="bold" color="gray">
                    Total Points
                  </Text>
                </Tooltip>
              </div>
              <div className="col-span-1">
                <Tooltip content="Rewards redeemed.">
                  <Text size="2" weight="bold" color="gray">
                    Redeemed
                  </Text>
                </Tooltip>
              </div>
            </div>
          </Flex>
          {isSearchUsersLoading || !searchUsers?.data ? (
            <TableSkeleton />
          ) : (
            <Flex className="w-full h-[530px]" direction="column">
              {searchUsers.data.users.map((searchUser, index) => (
                <DialogRoot
                  key={`users-table-dialog-${searchUser.id}`}
                  onOpenChange={(open) => {
                    if (open) setCurrentOpenUserId(searchUser.id);
                  }}
                >
                  <DialogTrigger>
                    <div
                      key={searchUser.id}
                      onClick={() => {}}
                      className={`grid grid-cols-8 gap-8 w-full ${
                        index !== 9 && 'border-b-[1px] border-gray-6'
                      } py-2 px-4 hover:cursor-pointer hover:bg-gray-3 items-center justify-center`}
                    >
                      <div className="col-span-2">
                        <Text size="2" color="gray">
                          {searchUser.id}
                        </Text>
                      </div>
                      <div className="col-span-3">
                        <Card variant="ghost" size="1">
                          <Flex align="center" gap="3">
                            <Avatar
                              color="indigo"
                              fallback="T"
                              size="2"
                              src={searchUser.profilePicUrl}
                              variant="square"
                            />
                            <Box>
                              <Text as="div" size="2" weight="bold">
                                {searchUser.nickname || searchUser.username}
                              </Text>
                              <Text as="div" color="gray" size="1">
                                {searchUser.username}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          {searchUser.points}
                        </Text>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          {searchUser.totalPoints}
                        </Text>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          {searchUser.rewardsRedeemed}
                        </Text>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>In-Depth View</DialogTitle>
                    <DialogDescription>
                      View and update user information.
                    </DialogDescription>
                    <Separator orientation="horizontal" size="4" />
                    <Flex direction="column" className="w-full" gap="4" mt="3">
                      {isCurrentUserLoading || !currentUser?.data ? (
                        <Flex justify="center" align="center">
                          <ClipLoader color="#8884d8" />
                        </Flex>
                      ) : (
                        <Flex direction="column" className="w-full" gap="4">
                          <Flex className="w-full">
                            <Card className="w-full" variant="ghost">
                              <Flex
                                direction="row"
                                gap="4"
                                justify="center"
                                align="center"
                                px="2"
                                py="2"
                                className="w-full"
                              >
                                <Flex direction="column" gap="1">
                                  <Avatar
                                    color="indigo"
                                    fallback="T"
                                    size="7"
                                    src={currentUser.data.profilePicUrl}
                                    variant="square"
                                  />
                                </Flex>
                                <Flex
                                  direction="column"
                                  className="w-full"
                                  gap="2"
                                >
                                  <Flex direction="column">
                                    <Text
                                      as="div"
                                      size="3"
                                      weight="bold"
                                      className="max-w-[150px] truncate"
                                    >
                                      {currentUser.data.nickname ||
                                        currentUser.data.username}
                                    </Text>
                                    <Text
                                      as="div"
                                      color="gray"
                                      size="2"
                                      className="max-w-[150px] truncate"
                                    >
                                      {currentUser.data.username}
                                    </Text>
                                    <Text size="2" color="violet">
                                      <Code>{currentUser.data.id}</Code>
                                    </Text>
                                  </Flex>
                                  <Text size="2" color="gray">
                                    Member since{' '}
                                    <Code>
                                      {new Date(
                                        currentUser.data.joinDate
                                      ).toLocaleString('en-us')}
                                    </Code>
                                  </Text>
                                </Flex>
                              </Flex>
                            </Card>
                          </Flex>
                          <Flex className="w-full">
                            <Card className="w-full">
                              <Flex
                                className="w-full"
                                direction="column"
                                gap="2"
                              >
                                <Flex className="w-full">
                                  <Flex
                                    px="2"
                                    py="2"
                                    className="w-full"
                                    justify="between"
                                    gap="4"
                                  >
                                    <Flex
                                      direction="column"
                                      gap="1"
                                      className="w-full"
                                    >
                                      <Text size="2">Points</Text>
                                      <TextFieldInput
                                        color="gray"
                                        value={currentUserPoints}
                                        onChange={(e) => {
                                          setCurrentUserPoints(
                                            parseInt(e.target.value)
                                          );
                                        }}
                                        type="number"
                                        size="2"
                                      />
                                    </Flex>
                                    <Flex
                                      direction="column"
                                      gap="1"
                                      className="w-full"
                                    >
                                      <Text size="2">Total Points</Text>
                                      <TextFieldInput
                                        color="gray"
                                        placeholder={currentUser.data.totalPoints.toLocaleString()}
                                        size="2"
                                        type="number"
                                        disabled={true}
                                      />
                                    </Flex>
                                  </Flex>
                                </Flex>
                                <Flex justify="end" gap="4">
                                  <Button
                                    size="2"
                                    variant="soft"
                                    color="red"
                                    className="hover:cursor-pointer"
                                    onClick={async () => {
                                      setCurrentUserPoints(
                                        currentUser.data?.points ?? 0
                                      );
                                    }}
                                  >
                                    Reset Points to Current
                                  </Button>
                                  <Button
                                    size="2"
                                    variant="soft"
                                    loading={isCurrentUserUpdating}
                                    onClick={async () => {
                                      const difference =
                                        currentUserPoints -
                                        (currentUser.data?.points ?? 0);

                                      setIsCurrentUserUpdating(true);
                                      await updatePoints(
                                        accessType,
                                        companyId,
                                        serviceType,
                                        serviceId,
                                        currentUser.data?.id ?? '',
                                        difference,
                                        currentUserPoints >
                                          (currentUser.data?.points ?? 0)
                                          ? 'add'
                                          : 'subtract'
                                      );
                                      await currentUserMutate();
                                      await searchUsersMutate();
                                      setIsCurrentUserUpdating(false);
                                    }}
                                    className="hover:cursor-pointer"
                                  >
                                    Update Points
                                  </Button>
                                </Flex>
                              </Flex>
                            </Card>
                          </Flex>
                          <Flex direction="column">
                            <Button
                              size="2"
                              variant="soft"
                              color="violet"
                              className="hover:cursor-pointer"
                              onClick={() => {
                                router.push(
                                  `/${accessType}/company/${companyId}/${serviceType}/${serviceId}/rewards?view=pending_rewards&searchTerm=${currentUser.data?.id}`
                                );
                              }}
                            >
                              View Redeemed Rewards
                            </Button>
                          </Flex>
                        </Flex>
                      )}
                    </Flex>
                  </DialogContent>
                </DialogRoot>
              ))}
            </Flex>
          )}
        </Inset>
      </Card>
      <Pagination
        currentPage={page}
        totalPages={searchUsers?.data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </Flex>
  );
}
