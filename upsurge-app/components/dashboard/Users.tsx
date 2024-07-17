import Image from 'next/image';
import { Bar, BarChart } from 'recharts';
import { Flex, SkeletonText } from 'frosted-ui';
import { AutoSizer } from 'react-virtualized';

export default function Users({
  isUsersLoading,
  users,
}: {
  isUsersLoading: boolean;
  users: {
    totalUsers: number;
    newUsers: Array<{
      day: Date;
      count: number;
    }>;
  };
}) {
  const percentChange = (() => {
    const todayCount = users.newUsers[0].count;
    const yesterdayCount = users.newUsers[1].count;

    const percentChange =
      yesterdayCount === 0
        ? 0
        : parseFloat(
            (((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(2)
          );

    return percentChange;
  })();

  const data = users.newUsers.map(({ day: oldDay, count }) => {
    const day = new Date(oldDay);

    const formattedDate = day.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return {
      name: formattedDate,
      date: day.toDateString(),
      count,
    };
  });

  return (
    <Flex className="flex flex-col bg-gray-2 rounded-lg px-6 py-4 shadow w-full">
      <div className="flex flex-row gap-2 text-[#6E6E91]">
        <Image src="/icons/members.svg" alt="eye" width={24} height={16} />
        <p>Users</p>
      </div>

      <div className="flex flex-row items-end justify-between gap-1">
        <div className="w-2/3">
          {isUsersLoading ? (
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
            <h1 className="font-bold text-[22px]">{users.totalUsers}</h1>
          )}
          {isUsersLoading ? (
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
                className={`${percentChange > 0 ? 'text-green-500' : ''} ${
                  percentChange < 0 ? 'text-red-500' : ''
                }`}
              >
                {percentChange}%
              </p>
              {percentChange > 0 && (
                <Image
                  src="/icons/green_arrow_up.svg"
                  width={14}
                  height={14}
                  alt="percent_up"
                />
              )}
              {percentChange < 0 && (
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
              <BarChart width={width} height={75} data={data}>
                <Bar
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
              </BarChart>
            )}
          </AutoSizer>
        </Flex>
      </div>
    </Flex>
  );
}
