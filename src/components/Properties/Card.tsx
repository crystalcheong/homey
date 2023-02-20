import {
  Badge,
  Card as MCard,
  CardProps,
  Group,
  Image,
  Skeleton,
  Text,
} from "@mantine/core";
import Link from "next/link";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import { logger } from "@/utils/debug";

interface Props extends Partial<CardProps> {
  listing: Listing;
  isLoading?: boolean;
}

const PriceTypes: string[] = ["/month", ""];
export type PriceType = (typeof PriceTypes)[number];
const PriceListingTypes: {
  [key in ListingType]: PriceType;
} = ListingTypes.reduce(
  (searchMap = {}, type: string, idx: number) => ({
    ...searchMap,
    [type]: PriceTypes[idx],
  }),
  {}
);

export const Card = ({
  listing,
  children,
  isLoading = false,
  ...rest
}: Props) => {
  const {
    id,
    listing_type,
    photo_url,
    attributes,
    sub_category_formatted,
    address_name,
  } = listing;

  const isPlaceholder = !Object.keys(listing).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;

  logger("Card.tsx line 50", { PriceListingTypes });
  const strPrice = `${attributes?.price_formatted ?? `$-.--`} SGD ${
    PriceListingTypes[listing_type]
  }`;

  return (
    <MCard
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      component={Link}
      href={`/property/${listing_type}/${id}`}
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
          <Text weight={500}>
            {attributes?.bedrooms_formatted}&nbsp;
            {sub_category_formatted}
            &nbsp;in&nbsp;{address_name}
          </Text>
          <Badge
            color="pink"
            variant="light"
          >
            {listing_type}
          </Badge>
        </Group>
      </Skeleton>

      <Skeleton visible={isSkeleton}>
        <Text
          component="p"
          size="sm"
          color="dimmed"
        >
          With Fjord Tours you can explore more of the magical fjord landscapes
          with tours and activities on and around the fjords of Norway
        </Text>
        <Text
          component="p"
          weight={500}
        >
          {strPrice}
        </Text>
      </Skeleton>

      {children}
    </MCard>
  );
};

export default Card;
