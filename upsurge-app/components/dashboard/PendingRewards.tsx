import Image from 'next/image';
import { Area, AreaChart } from 'recharts';
import { Flex, SkeletonText } from 'frosted-ui';
import { AutoSizer } from 'react-virtualized';

interface GroupedReward {
  date: string;
  amount: number;
}

function groupPendingRewardsByDay(
  pendingRewards: Array<{
    date: number;
    amount: number;
  }>
): {
  groupedRewards: GroupedReward[];
  percentageDifference: number;
} {
  const pastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0); // set time to start of day
    return d.getTime();
  });

  const groupedByDay: Record<number, number> = pastSevenDays.reduce(
    (acc, date) => ({ ...acc, [date]: 0 }),
    {}
  );

  pendingRewards.forEach((reward) => {
    const date = new Date(reward.date);
    date.setHours(0, 0, 0, 0); // set time to start of day
    const timestamp = date.getTime();
    if (timestamp in groupedByDay) groupedByDay[timestamp] += reward.amount;
  });

  const groupedRewards = Object.entries(groupedByDay).map(([date, amount]) => ({
    date: new Date(Number(date)).toLocaleDateString('en-US'),
    amount: Number(amount),
  }));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);

  const todayRewards = groupedByDay[today.getTime()] || 0;
  const yesterdayRewards = groupedByDay[yesterday.getTime()] || 0;

  const percentageDifference =
    yesterdayRewards === 0
      ? 0
      : ((todayRewards - yesterdayRewards) / yesterdayRewards) * 100;
  return { groupedRewards, percentageDifference };
}

export default function PendingRewards({
  isRewardsLoading,
  pendingRewards,
  groupedPendingRewards,
}: {
  isRewardsLoading: boolean;
  pendingRewards: number;
  groupedPendingRewards: Array<{
    date: number;
    amount: number;
  }>;
}) {
  const data = groupPendingRewardsByDay(groupedPendingRewards);

  return (
    <Flex className="flex flex-col bg-gray-2 rounded-lg px-6 py-4 shadow w-full">
      <div className="flex flex-row gap-2 text-[#6E6E91]">
        <Image src="/icons/eye.svg" alt="eye" width={24} height={16} />
        <p>Pending Rewards</p>
      </div>
      <div className="flex flex-row items-end justify-between gap-1">
        <div className="w-2/3">
          {isRewardsLoading ? (
            <Flex>
              <SkeletonText
                color="gray"
                size="6"
                style={{
                  width: 50,
                }}
              />
            </Flex>
          ) : (
            <h1 className="font-bold text-[22px]">{pendingRewards}</h1>
          )}
          {isRewardsLoading ? (
            <Flex>
              <SkeletonText
                color="gray"
                size="6"
                style={{
                  width: 50,
                }}
              />
            </Flex>
          ) : (
            <div className="flex flex-row gap-1">
              <p
                className={`${
                  data.percentageDifference > 0 ? 'text-green-500' : ''
                } ${data.percentageDifference < 0 ? 'text-red-500' : ''}`}
              >
                {data.percentageDifference.toFixed(2)}%
              </p>
              {data.percentageDifference > 0 && (
                <Image
                  src="/icons/green_arrow_up.svg"
                  width={14}
                  height={14}
                  alt="percent_up"
                />
              )}
              {data.percentageDifference < 0 && (
                <Image
                  src="/icons/red_arrow_down.svg"
                  width={14}
                  height={14}
                  alt="percent_up"
                />
              )}
            </div>
          )}
        </div>
        <Flex className="w-full">
          <AutoSizer disableHeight>
            {({ width }) => (
              <AreaChart width={width} height={75} data={data.groupedRewards}>
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </AreaChart>
            )}
          </AutoSizer>
        </Flex>
      </div>
    </Flex>
  );
}
