import { Flex, IconButton, Text } from 'frosted-ui';
import { type Dispatch, type SetStateAction, useState, useEffect } from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: Dispatch<SetStateAction<number>>;
}) {
  const [paginationRange, setPaginationRange] = useState<
    Array<number | string>
  >([]);

  function calculatePaginationRange(currentPage: number, totalPages: number) {
    const range = [];

    // If there are 5 or fewer total pages, just display them all
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const delta = 2; // Number of pages before and after the current page

      // Determine if ellipses are needed for the left and right blocks
      const leftEllipsisNeeded = currentPage - delta > 3;
      const rightEllipsisNeeded = currentPage + delta < totalPages - 2;

      // Always include the first two pages if left ellipsis is needed
      if (leftEllipsisNeeded) {
        range.push(1, 2);
      }

      // Include ellipsis if there are more than one page numbers in between
      if (leftEllipsisNeeded && currentPage - delta > 3) {
        range.push('...');
      }

      // Calculate the middle range of pages
      const middleStart = leftEllipsisNeeded
        ? Math.max(currentPage - delta, 3)
        : 1;
      const middleEnd = rightEllipsisNeeded
        ? Math.min(currentPage + delta, totalPages - 2)
        : totalPages;
      for (let i = middleStart; i <= middleEnd; i++) {
        range.push(i);
      }

      // Include ellipsis if there are more than one page numbers in between
      if (rightEllipsisNeeded && currentPage + delta < totalPages - 2) {
        range.push('...');
      }

      // Always include the last two pages if right ellipsis is needed
      if (rightEllipsisNeeded) {
        range.push(totalPages - 1, totalPages);
      }
    }

    return range;
  }

  useEffect(() => {
    const newRange = calculatePaginationRange(currentPage, totalPages);
    setPaginationRange(newRange);
  }, [currentPage, totalPages]);

  return (
    <Flex className="w-full" justify="between">
      <Flex gap="2">
        <IconButton
          size="2"
          variant="surface"
          disabled={currentPage < 3}
          onClick={() => {
            onPageChange(currentPage - 2);
          }}
          className="hover:cursor-pointer"
        >
          <Text size="2">{'<<'}</Text>
        </IconButton>
        <IconButton
          size="2"
          variant="surface"
          disabled={currentPage < 2}
          onClick={() => {
            onPageChange(currentPage - 1);
          }}
          className="hover:cursor-pointer"
        >
          <Text size="2">{'<'}</Text>
        </IconButton>
      </Flex>
      <Flex gap="2" justify="center" align="center">
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === '...') {
            // Render ellipsis with a unique key
            return (
              <Text key={`ellipsis-${index}`} size="2">
                ...
              </Text>
            );
          }
          // Render page number
          return (
            <IconButton
              key={pageNumber}
              size="2"
              variant={currentPage === pageNumber ? 'soft' : 'ghost'}
              onClick={() => {
                onPageChange(pageNumber as number);
              }}
              className={`hover:cursor-pointer ${
                currentPage === pageNumber ? 'selected' : ''
              }`}
            >
              <Text size="2">{pageNumber}</Text>
            </IconButton>
          );
        })}
      </Flex>

      <Flex gap="2">
        <IconButton
          size="2"
          variant="surface"
          disabled={currentPage >= totalPages}
          onClick={() => {
            onPageChange(currentPage + 1);
          }}
          className="hover:cursor-pointer"
        >
          <Text size="2">{'>'}</Text>
        </IconButton>
        <IconButton
          size="2"
          variant="surface"
          disabled={currentPage >= totalPages - 1}
          onClick={() => {
            onPageChange(currentPage + 2);
          }}
          className="hover:cursor-pointer"
        >
          <Text size="2">{'>>'}</Text>
        </IconButton>
      </Flex>
    </Flex>
  );
}
