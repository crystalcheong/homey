import {
  Badge,
  Card as MCard,
  CardProps,
  Group,
  Image,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import React from "react";

import { ProjectLaunch } from "@/data/clients/ninetyNine";

interface Props extends Partial<CardProps> {
  launch: ProjectLaunch;
  isLoading?: boolean;
}

const LaunchCard = ({
  launch,
  isLoading = false,
  children,
  ...rest
}: Props) => {
  const {
    development_id: id,
    name,
    // location,
    details,
    photo_url,
    formatted_launch_date,
    percentage_sold,
  } = launch;

  const isPlaceholder = !Object.keys(launch).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;

  return (
    <MCard
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      // component={Link}
      // href={listingRelativeLink}
      {...rest}
    >
      <MCard.Section>
        <Image
          src={photo_url}
          height={160}
          alt={id}
          fit="cover"
          withPlaceholder
        />
      </MCard.Section>

      <Skeleton visible={isSkeleton}>
        <Group
          position="apart"
          mt="md"
          mb="xs"
          spacing="xs"
        >
          <Title
            order={1}
            size="h4"
            truncate
          >
            {name}
          </Title>

          <Badge
            color="pink"
            variant="light"
          >
            {formatted_launch_date}
          </Badge>
        </Group>
      </Skeleton>

      <Skeleton visible={isSkeleton}>
        <Text tt="capitalize">
          <Text
            tt="uppercase"
            component="span"
          >
            {percentage_sold}
          </Text>
        </Text>
        <Text
          component="p"
          weight={500}
        >
          {details}
        </Text>
      </Skeleton>

      {children}
    </MCard>
  );
};

export default LaunchCard;
