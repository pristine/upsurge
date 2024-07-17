import { AdjustmentsHorizontalIcon } from '@heroicons/react/16/solid';
import {
  DialogRoot,
  DialogTrigger,
  IconButton,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Flex,
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Text,
} from 'frosted-ui';
import { type Dispatch, type SetStateAction } from 'react';

export default function FilterAndSort({
  sortBy,
  setSortBy,
  sort,
}: {
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
  sort: Array<{
    display: string;
    value: string;
  }>;
}) {
  return (
    <DialogRoot>
      <DialogTrigger>
        <IconButton size="3" className="hover:cursor-pointer hover:bg-gray-3">
          <AdjustmentsHorizontalIcon width={20} height={20} />
        </IconButton>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Filter and Sort</DialogTitle>
        <DialogDescription>Adjust filters and sorting.</DialogDescription>
        <Flex className="w-full" direction="column" gap="4">
          <Flex direction="column" gap="1">
            <Text size="2">Sort By</Text>
            <SelectRoot
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
              }}
            >
              <SelectTrigger />
              <SelectContent position="popper">
                <SelectItem value="none">None</SelectItem>
                {sort.map((sort, index) => (
                  <SelectItem
                    key={`sort-${sort.value}-${index}`}
                    value={sort.value}
                  >
                    {sort.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Flex>
        </Flex>
      </DialogContent>
    </DialogRoot>
  );
}
