import { updateAutomation } from '@/services/automations';
import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import { type MessageDropAutomation } from '@/types/automations';
import {
  Button,
  Card,
  Code,
  Flex,
  Grid,
  SkeletonRect,
  Switch,
  Text,
  TextFieldInput,
  TextFieldRoot,
} from 'frosted-ui';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ClipLoader } from 'react-spinners';

export default function MessageDrop({
  companyId,
  serviceId,
  serviceType,
  accessType,
}: {
  companyId: string;
  serviceType: string;
  serviceId: string;
  accessType: 'whop' | 'web';
}) {
  const [lowerBounds, setLowerBounds] = useState(0);
  const [upperBounds, setUpperBounds] = useState(0);

  const [amountLowerBounds, setAmountLowerBounds] = useState(0);
  const [amountUpperBounds, setAmountUpperBounds] = useState(0);

  const [isEnabledLoading, setIsEnabledLoading] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const { data, isLoading, mutate } = useSWR<
    ApiResponse<MessageDropAutomation | undefined>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/automations/messageDrop`,
    fetcher
  );

  useEffect(() => {
    if (data?.data && data.success) {
      setLowerBounds(data.data.lowerBounds);
      setUpperBounds(data.data.upperBounds);

      setAmountLowerBounds(data.data.amountLowerBounds);
      setAmountUpperBounds(data.data.amountUpperBounds);
    }
  }, [data]);

  return (
    <Flex direction="column" gap="4" py="2">
      <Flex direction="column">
        <Text weight="bold">Message Drop</Text>
        <Text color="gray" size="2">
          A set amount of points will be claimable in the main channel after a
          certain amount of time.
        </Text>
      </Flex>
      <Flex
        direction="row"
        align="center"
        gap="2"
        className="w-full"
        justify="between"
      >
        <Flex gap="2" justify="center" align="center">
          {!data || isLoading ? (
            <SkeletonRect
              color="gray"
              style={{
                height: 20,
                width: 30,
              }}
            />
          ) : isEnabledLoading ? (
            <ClipLoader color="#8884d8" size="20" />
          ) : (
            <Switch
              size="1"
              checked={data?.data?.enabled}
              onCheckedChange={async (checked) => {
                setIsEnabledLoading(true);
                await updateAutomation(
                  accessType,
                  companyId,
                  serviceType,
                  serviceId,
                  {
                    type: 'messageDrop',
                    enabled: checked,
                  }
                );
                await mutate();
                setIsEnabledLoading(false);
              }}
              className="hover:cursor-pointer"
            />
          )}
          <Text size="2" weight="bold">
            Enabled
          </Text>
        </Flex>
        <Flex justify="center" align="center" gap="4">
          <Text size="2">
            Current Goal: <Code>{data?.data?.goal}</Code>
          </Text>
          <Text size="2">
            Current Message Count: <Code>{data?.data?.currentCount}</Code>
          </Text>
          <Button
            variant="soft"
            size="1"
            className="hover:cursor-pointer"
            loading={isResetLoading}
            onClick={async () => {
              setIsResetLoading(true);
              await updateAutomation(
                accessType,
                companyId,
                serviceType,
                serviceId,
                {
                  type: 'messageDrop',
                  reset: true,
                }
              );
              await mutate();
              setIsResetLoading(false);
            }}
          >
            Reset
          </Button>
        </Flex>
      </Flex>
      <Flex justify="between" gap="4">
        <Flex>
          <Card className="w-full">
            <Flex direction="column" py="2" px="2">
              <Flex direction="column">
                <Text weight="bold">Message Count</Text>
                <Text color="gray" size="2">
                  Lower and Upper Bounds set the random message range for the
                  next drop. For example, if set to 10 and 20, the next drop
                  will happen randomly between 10 and 20 messages.
                </Text>
              </Flex>
              <Flex gap="4" mt="3" direction="column">
                <Grid gap="1" className="w-full">
                  <Text as="div" mb="1" size="2">
                    Lower Count Bound
                  </Text>
                  {!data || isLoading ? (
                    <SkeletonRect
                      color="gray"
                      style={{
                        width: '100%',
                        height: '30px',
                      }}
                    />
                  ) : (
                    <TextFieldRoot
                      color="gray"
                      size="2"
                      variant="surface"
                      className="w-full"
                    >
                      <TextFieldInput
                        size="2"
                        value={lowerBounds}
                        type="number"
                        onChange={(e) => {
                          setLowerBounds(parseInt(e.target.value));
                        }}
                      />
                    </TextFieldRoot>
                  )}
                </Grid>
                <Grid gap="1" className="w-full">
                  <Text as="div" mb="1" size="2">
                    Upper Count Bound
                  </Text>
                  {!data || isLoading ? (
                    <SkeletonRect
                      color="gray"
                      style={{
                        width: '100%',
                        height: '30px',
                      }}
                    />
                  ) : (
                    <TextFieldRoot
                      color="gray"
                      size="2"
                      variant="surface"
                      className="w-full"
                    >
                      <TextFieldInput
                        size="2"
                        value={upperBounds}
                        type="number"
                        onChange={(e) => {
                          setUpperBounds(parseInt(e.target.value));
                        }}
                      />
                    </TextFieldRoot>
                  )}
                </Grid>
                <Button
                  variant="soft"
                  onClick={async () => {
                    setIsButtonLoading(true);
                    if (lowerBounds > upperBounds) {
                      setLowerBounds(upperBounds);
                    }

                    await updateAutomation(
                      accessType,
                      companyId,
                      serviceType,
                      serviceId,
                      {
                        type: 'messageDrop',
                        lowerBounds,
                        upperBounds,
                      }
                    );

                    await mutate();

                    setIsButtonLoading(false);
                  }}
                  loading={isButtonLoading}
                >
                  Update
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
        <Flex>
          <Card className="w-full">
            <Flex direction="column" py="2" px="2">
              <Flex direction="column">
                <Text weight="bold">Claimable Amount</Text>
                <Text color="gray" size="2">
                  Lower and Upper Amount Bounds determine the range for the
                  random amount of points given in the next drop. For example,
                  if set to 10 and 20, the next drop will give a random amount
                  of points between 10 to 20.
                </Text>
              </Flex>
              <Flex gap="4" mt="3" direction="column">
                <Grid gap="1" className="w-full">
                  <Text as="div" mb="1" size="2">
                    Lower Amount Bound
                  </Text>
                  {!data || isLoading ? (
                    <SkeletonRect
                      color="gray"
                      style={{
                        width: '100%',
                        height: '30px',
                      }}
                    />
                  ) : (
                    <TextFieldRoot
                      color="gray"
                      size="2"
                      variant="surface"
                      className="w-full"
                    >
                      <TextFieldInput
                        size="2"
                        value={amountLowerBounds}
                        type="number"
                        onChange={(e) => {
                          setAmountLowerBounds(parseInt(e.target.value));
                        }}
                      />
                    </TextFieldRoot>
                  )}
                </Grid>
                <Grid gap="1" className="w-full">
                  <Text as="div" mb="1" size="2">
                    Upper Amount Bound
                  </Text>
                  {!data || isLoading ? (
                    <SkeletonRect
                      color="gray"
                      style={{
                        width: '100%',
                        height: '30px',
                      }}
                    />
                  ) : (
                    <TextFieldRoot
                      color="gray"
                      size="2"
                      variant="surface"
                      className="w-full"
                    >
                      <TextFieldInput
                        size="2"
                        value={amountUpperBounds}
                        type="number"
                        onChange={(e) => {
                          setAmountUpperBounds(parseInt(e.target.value));
                        }}
                      />
                    </TextFieldRoot>
                  )}
                </Grid>
                <Button
                  variant="soft"
                  onClick={async () => {
                    setIsButtonLoading(true);
                    if (amountLowerBounds > amountUpperBounds) {
                      setAmountLowerBounds(amountUpperBounds);
                    }

                    await updateAutomation(
                      accessType,
                      companyId,
                      serviceType,
                      serviceId,
                      {
                        type: 'messageDrop',
                        amountLowerBounds,
                        amountUpperBounds,
                      }
                    );

                    await mutate();

                    setIsButtonLoading(false);
                  }}
                  loading={isButtonLoading}
                >
                  Update
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
}
