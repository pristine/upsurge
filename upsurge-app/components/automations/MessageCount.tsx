import { updateAutomation } from '@/services/automations';
import { type ApiResponse } from '@/types/response';
import { fetcher } from '@/util/swr';
import { type MessageCountAutomation } from '@prisma/client';
import {
  Button,
  Card,
  Flex,
  Grid,
  SkeletonRect,
  Switch,
  Text,
  TextFieldInput,
  TextFieldRoot,
} from 'frosted-ui';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import useSWR from 'swr';

export default function MessageCount({
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
  const [lowerBounds, setLowerBounds] = useState(50);
  const [upperBounds, setUpperBounds] = useState(100);

  const [spamDelay, setSpamDelay] = useState(30);

  const [isEnabledLoading, setIsEnabledLoading] = useState(false);

  const { data, isLoading, mutate } = useSWR<
    ApiResponse<MessageCountAutomation | undefined>
  >(
    `/${accessType}/api/company/${companyId}/services/${serviceType}/${serviceId}/automations/messageCount`,
    fetcher
  );

  const [isButtonLoading, setIsButtonLoading] = useState(false);

  useEffect(() => {
    if (data?.data && data.success) {
      setLowerBounds(data.data.lowerBounds);
      setUpperBounds(data.data.upperBounds);
      setSpamDelay(data.data.spamDelay);
    }
  }, [data]);

  return (
    <Flex direction="column" gap="4" py="2">
      <Flex direction="column">
        <Text weight="bold">Message Count</Text>
        <Text color="gray" size="2">
          Users will be rewarded a point after every specified amount of
          messages.
        </Text>
      </Flex>
      <Flex direction="row" align="center" gap="2">
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
                  type: 'messageCount',
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
      <Flex gap="4">
        <Card>
          <Flex direction="column" py="2" px="2">
            <Flex direction="column">
              <Text weight="bold">Message Count</Text>
              <Text color="gray" size="2">
                Set a range with lower and upper bounds. Users earn a point
                after sending a random number of messages within this range.
              </Text>
            </Flex>
            <Flex gap="4" mt="3" direction="column">
              <Grid gap="1" className="w-full">
                <Text as="div" mb="1" size="2">
                  Lower Bound
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
                  Upper Bound
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
                      type: 'messageCount',
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
        <Card>
          <Flex direction="column" py="2" px="2">
            <Flex direction="column">
              <Text weight="bold">Spam Delay</Text>
              <Text color="gray" size="2">
                Set the delay between messages being accounted for, to prevent
                spam.
              </Text>
            </Flex>
            <Flex gap="4" mt="3" direction="column">
              <Grid gap="1" className="w-full">
                <Text as="div" mb="1" size="2">
                  Delay (seconds)
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
                      value={spamDelay}
                      type="number"
                      onChange={(e) => {
                        setSpamDelay(parseInt(e.target.value));
                      }}
                    />
                  </TextFieldRoot>
                )}
              </Grid>
              <Button
                variant="soft"
                onClick={async () => {
                  setIsButtonLoading(true);

                  await updateAutomation(
                    accessType,
                    companyId,
                    serviceType,
                    serviceId,
                    {
                      type: 'messageCount',
                      spamDelay,
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
  );
}
