'use client';

import MessageCount from '@/components/automations/MessageCount';
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Flex,
  Heading,
  Text,
} from 'frosted-ui';

export default function AutomationsPage({
  params,
}: {
  params: {
    accessType: 'whop' | 'web';
    companyId: string;
    serviceType: string;
    serviceId: string;
  };
}) {
  return (
    <Flex
      className="w-full rounded-lg bg-gray-2 pt-6 pb-8 px-8"
      direction="column"
      gap="4"
    >
      <Flex direction="column" gap="1">
        <Heading>Automations</Heading>
        <Text size="2">
          Automate point distribution through the following options.
        </Text>
      </Flex>
      <AccordionRoot type="single" collapsible={true} className="w-full">
        <Flex direction="column" gap="4" className="w-full">
          <AccordionItem value="messageCount">
            <AccordionTrigger>Message Count</AccordionTrigger>
            <AccordionContent>
              <MessageCount
                accessType={params.accessType}
                companyId={params.companyId}
                serviceId={params.serviceId}
                serviceType={params.serviceType}
              />
            </AccordionContent>
          </AccordionItem>
          {/* <AccordionItem value="messageDrop">
            <AccordionTrigger>Message Drop</AccordionTrigger>
            <AccordionContent>
              <MessageDrop
                companyId={params.companyId}
                serviceId={params.serviceId}
                serviceType={params.serviceType}
              />
            </AccordionContent>
          </AccordionItem> */}
          {/* <AccordionItem value="timedDrop">
            <AccordionTrigger>Timed Drop</AccordionTrigger>
            <AccordionContent></AccordionContent>
          </AccordionItem> */}
        </Flex>
      </AccordionRoot>
    </Flex>
  );
}
