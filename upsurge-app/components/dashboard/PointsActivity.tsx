import { type PointsDistribution } from '@/types/points';
import {
  Flex,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  Strong,
  Text,
  useThemeContext,
} from 'frosted-ui';
import { type Dispatch, type SetStateAction } from 'react';
import { BarLoader } from 'react-spinners';
import { PieChart, Pie } from 'recharts';

const CustomLabel = ({ cx, cy, text, fill }: any) => {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fill={fill}
      key={`pie-chart-${text}`}
    >
      <tspan x={cx} dy="-0.2em" fontSize={20} fontWeight={700}>
        {text.toLocaleString()}
      </tspan>
      <tspan x={cx} dy="1.2em">
        Total Points
      </tspan>
    </text>
  );
};

export default function PointsActivity({
  points,
  isPointsLoading,
  filter,
  setFilter,
}: {
  points: PointsDistribution;
  isPointsLoading: boolean;
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
}) {
  const themeContext = useThemeContext();

  const data = [
    {
      name: 'Points in Circulation',
      value: points.totalUsers,
      fill: '#0088FE',
    },
    {
      name: 'Points in Processed Rewards',
      value: points.totalProcessed,
      fill: '#00C49F',
    },
    {
      name: 'Points in Pending Rewards',
      value: points.totalUnprocessed,
      fill: '#FF8042',
    },
  ];

  const filterBy = [
    {
      name: 'All Time',
      value: 'all_time',
    },
    {
      name: 'One Year',
      value: 'one_year',
    },
    {
      name: 'Six Months',
      value: 'six_months',
    },
    {
      name: 'Three Months',
      value: 'three_months',
    },
    {
      name: 'One Month',
      value: 'one_month',
    },
    {
      name: 'Two Weeks',
      value: 'two_weeks',
    },
    {
      name: 'One Week',
      value: 'one_week',
    },
    {
      name: 'Two Days',
      value: 'two_days',
    },
    {
      name: 'One Day',
      value: 'one_day',
    },
  ];

  const totalPoints = data.reduce((acc, curr) => acc + Number(curr.value), 0);

  return (
    <Flex className="flex flex-col bg-gray-2 rounded-lg px-6 py-4 shadow w-full">
      <Flex direction="column" className="w-full">
        <Flex direction="row" gap="6" justify="between">
          <Text size="6" weight="bold">
            Points Activity
          </Text>
          <Flex justify="end">
            <SelectRoot
              defaultValue="all"
              value={filter}
              onValueChange={(val) => {
                setFilter(val);
              }}
            >
              <SelectTrigger className="rounded-lg hover:cursor-pointer" />
              <SelectContent>
                {filterBy.map((filter, index) => (
                  <SelectItem
                    key={`points-activity-filter-${filter.value}-$`}
                    value={filter.value}
                  >
                    {filter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Flex>
        </Flex>

        {isPointsLoading ? (
          <Flex
            direction="row"
            justify="center"
            align="center"
            className="w-full"
            py="9"
          >
            <BarLoader color="#8884d8" width={300} height={8} />
          </Flex>
        ) : (
          <Flex direction="row" gap="4" justify="between" className="w-full">
            <Flex className="pt-4 w-3/5">
              <PieChart width={200} height={200}>
                <Pie
                  data={data}
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  label={(entry) => (
                    <CustomLabel
                      {...entry}
                      key={`pie-chart-${totalPoints}-label`}
                      text={totalPoints}
                      fill={
                        themeContext.appearance === 'dark' ? '#FFF' : '#111'
                      }
                    />
                  )}
                  labelLine={false}
                />
              </PieChart>
            </Flex>
            <Flex className="py-6 w-full" align="center">
              <Flex
                direction="column"
                gap="4"
                justify="between"
                className="w-full"
              >
                <Flex gap="4" justify="between" className="w-full">
                  <Flex direction="row" gap="4" align="center">
                    <Flex
                      className={`rounded-full w-[10px] h-[10px] bg-[#0088FE] items-center`}
                    />
                    <Text>
                      <Strong>{points.totalUsers.toLocaleString()}</Strong>{' '}
                      Points in Circulation
                    </Text>
                  </Flex>
                  <Flex>
                    <Text>
                      <Strong>
                        {(Number(points.totalUsers) > 0
                          ? (Number(points.totalUsers) / totalPoints) * 100
                          : 0
                        ).toFixed(2)}
                        %
                      </Strong>
                    </Text>
                  </Flex>
                </Flex>
                <Flex justify="between" className="w-full">
                  <Flex direction="row" gap="4" align="center">
                    <Flex
                      className={`rounded-full w-[10px] h-[10px] bg-[#00C49F] items-center`}
                    />
                    <Text>
                      <Strong>{points.totalProcessed.toLocaleString()}</Strong>{' '}
                      Points in Processed Rewards
                    </Text>
                  </Flex>
                  <Flex>
                    <Text>
                      <Strong>
                        {(Number(points.totalProcessed) > 0
                          ? (Number(points.totalProcessed) / totalPoints) * 100
                          : 0
                        ).toFixed(2)}
                        %
                      </Strong>
                    </Text>
                  </Flex>
                </Flex>
                <Flex justify="between" className="w-full">
                  <Flex direction="row" gap="4" align="center">
                    <Flex
                      className={`rounded-full w-[10px] h-[10px] bg-[#FF8042] items-center`}
                    />
                    <Text>
                      <Strong>
                        {points.totalUnprocessed.toLocaleString()}
                      </Strong>{' '}
                      Points in Pending Rewards
                    </Text>
                  </Flex>
                  <Flex>
                    <Text>
                      <Strong>
                        {(Number(points.totalUnprocessed) > 0
                          ? (Number(points.totalUnprocessed) / totalPoints) *
                            100
                          : 0
                        ).toFixed(2)}
                        %
                      </Strong>
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
