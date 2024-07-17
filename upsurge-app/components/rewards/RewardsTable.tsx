'use client';

import { type ApiResponse } from '@/types/response';
import { type Reward } from '@/types/rewards';
import { fetcher } from '@/util/swr';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { useDebounce } from '@uidotdev/usehooks';
import {
  Flex,
  TextFieldRoot,
  TextFieldSlot,
  TextFieldInput,
  Card,
  Inset,
  Text,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Button,
  SkeletonText,
  ScrollArea,
  Separator,
  TextArea,
  Switch,
} from 'frosted-ui';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import AddReward from './AddReward';
import Pagination from '../Pagination';
import FilterAndSort from '../FilterAndSort';
import { ClipLoader } from 'react-spinners';
import { updateReward } from '@/services/rewards';

function TableSkeleton() {
  return (
    <Flex className="w-full h-[320px]" direction="column">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            key={`pl-users-table-${index}`}
            onClick={() => {}}
            className={`grid grid-cols-8 gap-8 w-full ${
              index !== 4 && 'border-b-[1px] border-gray-6'
            } py-2 px-4 items-center justify-center`}
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
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 300,
                }}
              />
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 300,
                }}
              />
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

export default function RewardsTable({
  companyId,
  serviceType,
  serviceId,
  accessType,
}: {
  companyId: string;
  serviceType: string;
  serviceId: string;
  accessType: 'whop' | 'web';
}) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState('none');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [currentRewardId, setCurrentRewardId] = useState('');
  const [currentRewardDescription, setCurrentRewardDescription] = useState('');
  const [currentRewardNickname, setCurrentRewardNickname] = useState('');
  const [currentRewardPointsRequired, setCurrentRewardPointsRequired] =
    useState(0);

  const [isCurrentRewardUpdating, setIsCurrentRewardUpdating] = useState(false);

  const {
    data: searchRewards,
    isLoading: isSearchRewardsLoading,
    mutate: searchRewardsMutate,
  } = useSWR<
    ApiResponse<{
      rewards: Reward[];
      totalPages: number;
      perPage: number;
      totalRewards: number;
    }>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/rewards/search?page=${page}&term=${debouncedSearchTerm}&sortBy=${sortBy}&showInactiveOnly=${showInactiveOnly.toString()}`,
    fetcher
  );

  const {
    data: currentReward,
    isLoading: isCurrentRewardLoading,
    mutate: currentRewardMutate,
  } = useSWR<ApiResponse<Reward>>(
    currentRewardId
      ? `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/rewards/${currentRewardId}`
      : null,
    fetcher
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (currentReward?.data) {
      setCurrentRewardDescription(currentReward.data.description);
      setCurrentRewardNickname(currentReward.data.nickname);
      setCurrentRewardPointsRequired(currentReward.data.pointsRequired);
    }
  }, [currentReward]);

  return (
    <Flex
      className="w-full bg-gray-2 rounded-lg px-6 pb-6 gap-4"
      direction="column"
    >
      <Flex justify="between" gap="4" className="w-full">
        <Flex justify="center" align="center">
          <Text size="2" color="gray">
            Rewards in Search: {searchRewards?.data?.totalRewards ?? 0}
          </Text>
        </Flex>
        <Flex gap="4">
          <Flex gap="2" justify="center" align="center">
            <Switch
              size="1"
              color="violet"
              checked={showInactiveOnly}
              onCheckedChange={(checked) => {
                setShowInactiveOnly(checked);
              }}
            />{' '}
            <Text size="2" color="gray">
              Show Inactive Only
            </Text>
          </Flex>
          <AddReward
            accessType={accessType}
            companyId={companyId}
            serviceId={serviceId}
            serviceType={serviceType}
            rewardsMutate={searchRewardsMutate}
          />
        </Flex>
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
            placeholder="Search for reward(s)"
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
              display: 'Points Required',
              value: 'pointsRequired',
            },
            {
              display: 'Amount Redeemed',
              value: 'amountRedeemed',
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
                  Nickname
                </Text>
              </div>
              <div className="col-span-3">
                <Text size="2" weight="bold" color="gray">
                  Description
                </Text>
              </div>
              <div className="col-span-1">
                <Text size="2" weight="bold" color="gray">
                  Points
                </Text>
              </div>
              <div className="col-span-1">
                <Text size="2" weight="bold" color="gray">
                  Redeemed
                </Text>
              </div>
              <div className="col-span-1">
                <Text size="2" weight="bold" color="gray">
                  Created
                </Text>
              </div>
            </div>
          </Flex>
          {isSearchRewardsLoading || !searchRewards?.data ? (
            <TableSkeleton />
          ) : (
            <Flex className="w-full h-[320px]" direction="column">
              {searchRewards.data.rewards.map((reward, index) => (
                <DialogRoot
                  key={`reward-${reward.id}`}
                  onOpenChange={(open) => {
                    if (open) setCurrentRewardId(reward.id);
                  }}
                >
                  <DialogTrigger>
                    <div
                      key={reward.id}
                      onClick={() => {}}
                      className={`grid grid-cols-8 gap-8 w-full ${
                        index !== 4 && 'border-b-[1px] border-gray-6'
                      } py-2 px-4 hover:cursor-pointer hover:bg-gray-3 items-center justify-center max-h-[65px] h-[65px]`}
                    >
                      <div className="col-span-2">
                        <Text size="2" weight="bold" color="gray">
                          {reward.nickname}
                        </Text>
                      </div>
                      <div className="col-span-3">
                        <ScrollArea
                          scrollbars="vertical"
                          size="1"
                          style={{
                            maxHeight: 50,
                          }}
                          type="auto"
                          className="justify-center items-center"
                        >
                          <Text as="p" size="2" color="gray" mr="3">
                            {reward.description}
                          </Text>
                        </ScrollArea>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          {reward.pointsRequired}
                        </Text>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          {reward.amountRedeemed}
                        </Text>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          {new Date(reward.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>In-Depth View</DialogTitle>
                    <DialogDescription>
                      View and change information.
                    </DialogDescription>
                    <Separator orientation="horizontal" size="4" />
                    {isCurrentRewardLoading || !currentReward?.data ? (
                      <Flex justify="center" align="center" mt="4">
                        <ClipLoader color="#8884d8" />
                      </Flex>
                    ) : (
                      <Flex direction="column" mt="4" gap="3">
                        <Flex direction="column">
                          <Text as="div" mb="1" size="2" weight="bold">
                            ID
                          </Text>
                          <TextFieldRoot
                            color="gray"
                            size="2"
                            variant="surface"
                            className="w-2/3"
                          >
                            <TextFieldInput
                              size="2"
                              value={reward.id}
                              disabled={true}
                            />
                          </TextFieldRoot>
                        </Flex>
                        <Flex direction="column">
                          <Text as="div" mb="1" size="2" weight="bold">
                            Date Created
                          </Text>
                          <TextFieldRoot
                            color="gray"
                            size="2"
                            variant="surface"
                            className="w-2/3"
                          >
                            <TextFieldInput
                              size="2"
                              value={new Date(reward.createdAt).toLocaleString(
                                'en-us'
                              )}
                              disabled={true}
                            />
                          </TextFieldRoot>
                        </Flex>
                        <Flex direction="column">
                          <Text as="div" mb="1" size="2" weight="bold">
                            Nickname
                          </Text>
                          <TextFieldRoot
                            color="gray"
                            size="2"
                            variant="surface"
                            className="w-2/3"
                          >
                            <TextFieldInput
                              size="2"
                              value={currentRewardNickname}
                              onChange={(e) => {
                                setCurrentRewardNickname(e.target.value);
                              }}
                            />
                          </TextFieldRoot>
                        </Flex>
                        <Flex direction="column">
                          <Text as="div" mb="1" size="2">
                            Description
                          </Text>
                          <TextArea
                            color="gray"
                            placeholder="Description goes here..."
                            size="2"
                            variant="surface"
                            value={currentRewardDescription}
                            onChange={(e) => {
                              setCurrentRewardDescription(e.target.value);
                            }}
                          />
                        </Flex>
                        <Flex direction="column">
                          <Text as="div" mb="1" size="2">
                            Points Required
                          </Text>
                          <TextFieldRoot
                            size="2"
                            variant="surface"
                            className="w-2/3"
                          >
                            <TextFieldInput
                              size="2"
                              type="number"
                              value={currentRewardPointsRequired}
                              onChange={(e) => {
                                setCurrentRewardPointsRequired(
                                  parseInt(e.target.value)
                                );
                              }}
                            />
                          </TextFieldRoot>
                        </Flex>
                        <Flex justify="end" gap="2">
                          <Button
                            color="red"
                            variant="soft"
                            onClick={async () => {
                              setIsCurrentRewardUpdating(true);

                              await updateReward(
                                accessType,
                                companyId,
                                serviceType,
                                serviceId,
                                reward.id,
                                {
                                  active: !reward.active,
                                }
                              );

                              await currentRewardMutate();
                              await searchRewardsMutate();

                              setIsCurrentRewardUpdating(false);
                            }}
                            className="hover:cursor-pointer"
                            loading={isCurrentRewardUpdating}
                          >
                            Set {reward.active ? 'Inactive' : 'Active'}
                          </Button>
                          <Button
                            color="violet"
                            variant="soft"
                            onClick={async () => {
                              setIsCurrentRewardUpdating(true);

                              await updateReward(
                                accessType,
                                companyId,
                                serviceType,
                                serviceId,
                                reward.id,
                                {
                                  description: currentRewardDescription,
                                  nickname: currentRewardNickname,
                                  pointsRequired: currentRewardPointsRequired,
                                }
                              );

                              await currentRewardMutate();
                              await searchRewardsMutate();

                              setIsCurrentRewardUpdating(false);
                            }}
                            className="hover:cursor-pointer"
                            loading={isCurrentRewardUpdating}
                          >
                            Update
                          </Button>
                        </Flex>
                      </Flex>
                    )}
                  </DialogContent>
                </DialogRoot>
              ))}
            </Flex>
          )}
        </Inset>
      </Card>
      <Pagination
        currentPage={page}
        totalPages={searchRewards?.data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </Flex>
  );
}
