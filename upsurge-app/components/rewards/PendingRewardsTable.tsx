import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { useDebounce } from '@uidotdev/usehooks';
import {
  Text,
  Flex,
  TextFieldRoot,
  TextFieldSlot,
  TextFieldInput,
  Card,
  Inset,
  ScrollArea,
  Avatar,
  Box,
  Badge,
  Switch,
  SkeletonText,
  SkeletonAvatar,
  CalloutRoot,
  CalloutIcon,
  CalloutText,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  AlertDialogRoot,
  AlertDialogTrigger,
  AlertDialogContent,
  Button,
  AlertDialogDescription,
  AlertDialogTitle,
  Code,
  Separator,
} from 'frosted-ui';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import FilterAndSort from '../FilterAndSort';
import Pagination from '../Pagination';
import { type RedeemedRewardSearch } from '@/types/rewards';
import { updateRedeemedReward } from '@/services/rewards';
import { useSearchParams } from 'next/navigation';

function Status({ created, processed }: { created: Date; processed: boolean }) {
  const currentDate = new Date();
  const diffTime = Math.abs(
    currentDate.getTime() - new Date(created).getTime()
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (processed) {
    return (
      <Badge size="1" color="success">
        Processed
      </Badge>
    );
  } else if (diffDays > 7) {
    return (
      <Badge size="1" color="danger">
        Urgent
      </Badge>
    );
  } else if (diffDays > 3) {
    return (
      <Badge size="1" color="warning">
        Medium
      </Badge>
    );
  } else {
    return (
      <Badge size="1" color="info">
        Low
      </Badge>
    );
  }
}

function TableSkeleton() {
  return (
    <Flex className="w-full h-[320px]" direction="column">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            key={`pl-users-table-${index}`}
            onClick={() => {}}
            className={`grid grid-cols-9 gap-8 w-full ${
              index !== 4 && 'border-b-[1px] border-gray-6'
            } py-2 px-4 items-center justify-center max-h-[65px] h-[65px]`}
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
            <div className="col-span-2">
              <Flex align="center" direction="row" gap="4">
                <SkeletonAvatar color="gray" size="2" />
                <Flex direction="column">
                  <SkeletonText
                    size="1"
                    color="gray"
                    style={{
                      width: 125,
                    }}
                  />
                  <SkeletonText
                    size="1"
                    color="gray"
                    style={{
                      width: 125,
                    }}
                  />
                </Flex>
              </Flex>
            </div>
            <div className="col-span-2">
              <SkeletonText
                color="gray"
                style={{
                  width: 175,
                }}
              />
            </div>
            <div className="col-span-1">
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 50,
                }}
              />
            </div>
            <div className="col-span-2">
              <SkeletonText
                size="2"
                color="gray"
                style={{
                  width: 175,
                }}
              />
            </div>
          </div>
        ))}
    </Flex>
  );
}

export default function PendingRewardsTable({
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
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('searchTerm') ?? ''
  );
  const [sortBy, setSortBy] = useState('none');
  const [showProcessedOnly, setShowProcessedOnly] = useState(false);

  const [isProcessPendingRewardOpen, setIsProcessPendingRewardOpen] =
    useState(false);
  const [isProcessingPendingReward, setIsProcessingPendingReward] =
    useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: searchRewards,
    isLoading: isSearchRewardsLoading,
    mutate: searchRewardsMutate,
  } = useSWR<
    ApiResponse<{
      redeemedRewards: RedeemedRewardSearch[];
      totalPages: number;
      perPage: number;
      totalRedeemedRewards: number;
    }>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/redeemed-rewards/search?page=${page}&term=${debouncedSearchTerm}&sortBy=${sortBy}&showProcessedOnly=${showProcessedOnly.toString()}`,
    fetcher
  );

  useEffect(() => {
    if (searchRewards?.data && page > searchRewards.data.totalPages) {
      setPage(1);
    }
  }, [searchRewards]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  return (
    <Flex
      className="w-full bg-gray-2 rounded-lg px-6 pb-6 gap-4"
      direction="column"
    >
      <Flex justify="between" gap="4" className="w-full">
        <Flex justify="center" align="center">
          <Text size="2" color="gray">
            Redeemed Rewards in Search:{' '}
            {searchRewards?.data?.totalRedeemedRewards ?? 0}
          </Text>
        </Flex>
        <Flex gap="2" justify="center" align="center">
          <Switch
            size="1"
            color="violet"
            checked={showProcessedOnly}
            onCheckedChange={(checked) => {
              setShowProcessedOnly(checked);
            }}
          />{' '}
          <Text size="2" color="gray">
            Show Processed Only
          </Text>
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
            placeholder="Search by user or reward..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="w-full"
          />
        </TextFieldRoot>
        <FilterAndSort setSortBy={setSortBy} sortBy={sortBy} sort={[]} />
      </Flex>
      <Card className="w-full">
        <Inset clip="border-box" side="all">
          <Flex
            direction="row"
            className="w-full bg-gray-3 border-b-[1px] border-gray-6"
            py="3"
          >
            <div className="grid grid-cols-9 gap-8 w-full px-4">
              <div className="col-span-2">
                <Text size="2" weight="bold" color="gray">
                  User ID
                </Text>
              </div>
              <div className="col-span-2">
                <Text size="2" weight="bold" color="gray">
                  User
                </Text>
              </div>
              <div className="col-span-2">
                <Text size="2" weight="bold" color="gray">
                  Reward
                </Text>
              </div>
              <div className="col-span-1">
                <Text size="2" weight="bold" color="gray">
                  Status
                </Text>
              </div>
              <div className="col-span-2">
                <Text size="2" weight="bold" color="gray">
                  {showProcessedOnly ? 'Processed' : 'Created'}
                </Text>
              </div>
            </div>
          </Flex>
          {isSearchRewardsLoading || !searchRewards?.data ? (
            <TableSkeleton />
          ) : searchRewards.data.redeemedRewards.length === 0 ? (
            <Flex
              className="w-full h-[320px]"
              justify="center"
              align="center"
              direction="column"
            >
              <CalloutRoot color="violet">
                <CalloutIcon>i</CalloutIcon>
                <CalloutText>
                  No new pending rewards, you&apos;re all caught up!
                </CalloutText>
              </CalloutRoot>
            </Flex>
          ) : (
            <Flex className="w-full h-[320px]" direction="column">
              {searchRewards.data.redeemedRewards.map((reward, index) => (
                <DialogRoot key={`pending-reward-${reward.id}`}>
                  <DialogTrigger>
                    <div
                      key={reward.id}
                      onClick={() => {}}
                      className={`grid grid-cols-9 gap-8 w-full ${
                        index !== 4 && 'border-b-[1px] border-gray-6'
                      } px-4 hover:cursor-pointer hover:bg-gray-3 items-center justify-center max-h-[65px] h-[65px]`}
                    >
                      <div className="col-span-2">
                        <Text size="2" weight="bold" color="gray">
                          {reward.user.id}
                        </Text>
                      </div>
                      <div className="col-span-2">
                        <Card variant="ghost" size="1">
                          <Flex align="center" gap="3">
                            <Avatar
                              color="indigo"
                              fallback="T"
                              size="2"
                              src={reward.user.profilePicUrl}
                              variant="square"
                            />
                            <Box>
                              <Text as="div" size="2" weight="bold">
                                {reward.user.nickname || reward.user.username}
                              </Text>
                              <Text as="div" color="gray" size="1">
                                {reward.user.username}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>
                      </div>
                      <div className="col-span-2">
                        <Text size="2" color="gray">
                          {reward.reward.nickname}
                        </Text>
                      </div>
                      <div className="col-span-1">
                        <Text size="2" color="gray">
                          <Status
                            created={reward.createdAt}
                            processed={reward.processed}
                          />
                        </Text>
                      </div>
                      <div className="col-span-2">
                        <Text size="2" color="gray">
                          {showProcessedOnly
                            ? reward.processedAt
                              ? new Date(reward.processedAt).toLocaleString()
                              : 'Unknown'
                            : new Date(reward.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>In-Depth View</DialogTitle>
                    <DialogDescription>
                      View information, change information, and update
                      processing status.
                    </DialogDescription>
                    <Separator orientation="horizontal" size="4" />
                    <Flex direction="column" mt="3">
                      <Text as="div" mb="1" size="2" weight="bold">
                        Pending Reward
                      </Text>
                      <Card>
                        <Text as="div" mb="1" size="2" weight="bold">
                          ID: <Code>{reward.id}</Code>
                        </Text>
                        <Text as="div" mb="1" size="2" weight="bold">
                          Date Redeemed:{' '}
                          <Code>
                            {' '}
                            {new Date(reward.createdAt).toLocaleString('en-us')}
                          </Code>
                        </Text>
                        {reward.processedAt && (
                          <Text as="div" mb="1" size="2" weight="bold">
                            Date Processed:{' '}
                            <Code>
                              {' '}
                              {new Date(reward.processedAt).toLocaleString(
                                'en-us'
                              )}
                            </Code>
                          </Text>
                        )}
                      </Card>
                    </Flex>
                    <Flex direction="row" gap="4" mt="4">
                      <Flex direction="column">
                        <Text as="div" mb="1" size="2" weight="bold">
                          User
                        </Text>
                        <Card>
                          <Flex direction="column" px="2" py="1">
                            <Flex align="center" gap="3">
                              <Avatar
                                color="indigo"
                                fallback="T"
                                size="4"
                                src={reward.user.profilePicUrl}
                                variant="square"
                              />
                              <Box>
                                <Text as="div" size="2" weight="bold">
                                  {reward.user.nickname || reward.user.username}
                                </Text>
                                <Text as="div" color="gray" size="1">
                                  {reward.user.username}
                                </Text>
                                <Text as="div" color="gray" size="1">
                                  {reward.user.id}
                                </Text>
                              </Box>
                            </Flex>
                          </Flex>
                        </Card>
                      </Flex>

                      <Flex direction="column">
                        <Text as="div" mb="1" size="2" weight="bold">
                          Reward
                        </Text>
                        <Card>
                          <Flex direction="column">
                            <Text size="2" weight="bold">
                              {reward.reward.nickname}
                            </Text>
                            <Text size="1" color="violet">
                              {reward.reward.pointsRequired} Points Required
                            </Text>
                            <ScrollArea
                              scrollbars="vertical"
                              size="1"
                              style={{
                                maxHeight: 100,
                              }}
                              type="auto"
                              className="justify-center items-center"
                              my="1"
                            >
                              <Box pr="4">
                                <Text size="1" color="gray">
                                  {reward.reward.description}
                                </Text>
                              </Box>
                            </ScrollArea>
                          </Flex>
                        </Card>
                      </Flex>
                    </Flex>
                    <Flex mt="4">
                      {!reward.processed && (
                        <AlertDialogRoot
                          open={isProcessPendingRewardOpen}
                          onOpenChange={(open) => {
                            setIsProcessPendingRewardOpen(open);
                          }}
                        >
                          <AlertDialogTrigger>
                            <Button color="violet" variant="soft">
                              Process Pending Reward
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            size="3"
                            style={{
                              maxWidth: 450,
                            }}
                          >
                            <AlertDialogTitle>Process Reward</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure? You won&apos;t be able to undo this
                              action, so make sure you deliver the reward before
                              doing so!
                            </AlertDialogDescription>
                            <Flex gap="3" justify="end" mt="4">
                              <Button
                                color="gray"
                                variant="soft"
                                onClick={() => {
                                  setIsProcessPendingRewardOpen(false);
                                }}
                                className="hover:cursor-pointer"
                              >
                                Cancel
                              </Button>
                              <Button
                                color="violet"
                                variant="soft"
                                onClick={async () => {
                                  setIsProcessingPendingReward(true);

                                  await updateRedeemedReward(
                                    accessType,
                                    companyId,
                                    serviceType,
                                    serviceId,
                                    reward.id,
                                    {
                                      processed: true,
                                    }
                                  );

                                  await searchRewardsMutate();

                                  setIsProcessingPendingReward(false);

                                  setIsProcessPendingRewardOpen(false);
                                }}
                                className="hover:cursor-pointer"
                                loading={isProcessingPendingReward}
                              >
                                Process
                              </Button>
                            </Flex>
                          </AlertDialogContent>
                        </AlertDialogRoot>
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
        totalPages={searchRewards?.data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </Flex>
  );
}
