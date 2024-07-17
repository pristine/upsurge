import { addReward } from '@/services/rewards';
import { GiftIcon } from '@heroicons/react/16/solid';
import {
  DialogRoot,
  DialogTrigger,
  Flex,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Grid,
  TextFieldRoot,
  TextFieldInput,
  TextArea,
  Button,
  Text,
} from 'frosted-ui';
import { useState, useRef, useEffect } from 'react';

export default function AddReward({
  accessType,
  companyId,
  serviceId,
  serviceType,
  rewardsMutate,
}: {
  accessType: 'whop' | 'web';
  companyId: string;
  serviceId: string;
  serviceType: string;
  rewardsMutate: Function;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(1);

  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const dialogRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        dialogRef.current &&
        !(dialogRef.current as any).contains(event.target)
      ) {
        setIsDialogOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dialogRef]);

  return (
    <DialogRoot open={isDialogOpen}>
      <DialogTrigger>
        <Button
          onClick={() => {
            setIsDialogOpen(true);
          }}
          size="3"
          className="hover:cursor-pointer hover:scale-105"
        >
          <Flex justify="center" gap="2" align="center">
            <GiftIcon className="h-3 w-3" />
            <Text size="2">Add a new reward</Text>
          </Flex>
        </Button>
      </DialogTrigger>
      <DialogContent ref={dialogRef}>
        <DialogTitle>Add a new reward</DialogTitle>
        <DialogDescription>
          Fill out the following fields to add a reward.
        </DialogDescription>
        <Flex mt="4" gap="4" direction="column" className="w-full">
          <Grid gap="1" className="w-full">
            <Text as="div" mb="1" size="2" weight="bold">
              Nickname
            </Text>
            <TextFieldRoot
              color="gray"
              size="2"
              variant="surface"
              className="w-full"
            >
              <TextFieldInput
                size="2"
                placeholder="Max of 100 characters"
                value={title}
                maxLength={100}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
            </TextFieldRoot>
          </Grid>
          <Grid gap="1" className="w-full">
            <Text as="div" mb="1" size="2" weight="bold">
              Description
            </Text>
            <TextArea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder="Reward description..."
            />
          </Grid>
          <Grid gap="1" className="w-full">
            <Text as="div" mb="1" size="2" weight="bold">
              Points Required
            </Text>
            <TextFieldRoot
              color="gray"
              size="2"
              variant="surface"
              className="w-full"
            >
              <TextFieldInput
                size="2"
                value={points}
                type="number"
                onChange={(e) => {
                  setPoints(parseInt(e.target.value));
                }}
              />
            </TextFieldRoot>
          </Grid>
        </Flex>
        <Flex justify="end" direction="row" mt="4" gap="3">
          <Button
            className="hover:cursor-pointer"
            color="gray"
            onClick={() => {
              setIsDialogOpen(false);
            }}
            variant="soft"
          >
            Cancel
          </Button>
          <Button
            className="hover:cursor-pointer"
            color="success"
            onClick={async () => {
              if (title.length === 0) {
                // toast.error('You must select a product!');
                return;
              }

              setIsButtonLoading(true);
              await addReward(
                accessType,
                companyId,
                serviceType,
                serviceId,
                title,
                description,
                points
              );

              await rewardsMutate();

              setIsButtonLoading(false);

              setTitle('');
              setDescription('');
              setPoints(1);
              setIsDialogOpen(false);
            }}
            disabled={!title || !description}
            loading={isButtonLoading}
          >
            Add
          </Button>
        </Flex>
      </DialogContent>
    </DialogRoot>
  );
}
