import { type User } from '@/types/users';
import {
  Card,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  IconButton,
  Flex,
  Avatar,
  Box,
  Text,
  CalloutRoot,
  CalloutIcon,
  CalloutText,
  ScrollArea,
  SkeletonAvatar,
  SkeletonText,
} from 'frosted-ui';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

function PointHolder({ user }: { user: User }) {
  return (
    <Card size="2" variant="ghost">
      <Flex align="center" gap="3" justify="between">
        <Flex gap="3">
          <Avatar
            color="indigo"
            fallback="U"
            src={user.profilePicUrl}
            variant="square"
          />
          <Box>
            <Text as="div" size="2" weight="bold">
              {user.username}
            </Text>
            <Text as="div" color="blue" size="2">
              {user.points} points
            </Text>
          </Box>
        </Flex>
        <Flex>
          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              <IconButton
                className="hover:cursor-pointer"
                size="1"
                variant="ghost"
                color="gray"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  fill="none"
                >
                  <path
                    fill="#A8A8BD"
                    d="M12.188 10a2.187 2.187 0 1 1-4.375 0 2.187 2.187 0 0 1 4.375 0ZM10 5.937a2.187 2.187 0 1 0 0-4.374 2.187 2.187 0 0 0 0 4.375Zm0 8.125a2.187 2.187 0 1 0 0 4.375 2.187 2.187 0 0 0 0-4.375Z"
                  />
                </svg>
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  void navigator.clipboard.writeText(user.id);
                }}
                shortcut="⌘ C + I"
              >
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </Flex>
      </Flex>
    </Card>
  );
}

export default function TopPointHolders({
  users,
  isUsersLoading,
}: {
  users: User[];
  isUsersLoading: boolean;
}) {
  return (
    <Flex className="flex flex-col bg-gray-2 rounded-lg pl-6 pr-2 py-4 shadow w-full gap-4 h-full">
      <div className="flex flex-row gap-2">
        <Text className="font-bold text-[20px]">Top Point Holders</Text>
      </div>
      <div className="flex flex-col gap-4 h-full flex-1 flex-grow">
        <AutoSizer disableWidth>
          {({ height }) => (
            <ScrollArea
              scrollbars="vertical"
              size="1"
              type="auto"
              style={{
                height,
              }}
            >
              <Box pr="3">
                {isUsersLoading ? (
                  <Flex direction="column" gap="2">
                    {Array(10)
                      .fill(null)
                      .map((_, index) => (
                        <Flex
                          key={`top-point-holders-skeleton-${index}`}
                          direction="row"
                          align="center"
                          gap="1"
                        >
                          <SkeletonAvatar color="gray" />
                          <Flex direction="column">
                            <React.Fragment key=".0">
                              <SkeletonText
                                color="gray"
                                style={{
                                  width: 150,
                                }}
                              />
                              <SkeletonText
                                color="gray"
                                style={{
                                  width: 100,
                                }}
                              />
                            </React.Fragment>
                          </Flex>
                        </Flex>
                      ))}
                  </Flex>
                ) : users.length === 0 ? (
                  <CalloutRoot color="red">
                    <CalloutIcon>🚨</CalloutIcon>
                    <CalloutText>No users found.</CalloutText>
                  </CalloutRoot>
                ) : (
                  users.map((user) => <PointHolder key={user.id} user={user} />)
                )}
              </Box>
            </ScrollArea>
          )}
        </AutoSizer>
      </div>
    </Flex>
  );
}
