import {
  Badge,
  Card as MCard,
  CardProps,
  Group,
  Image,
  Skeleton,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import { useIsTablet } from "@/utils/dom";

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
    main_category,
    address_name,
  } = listing;

  const theme = useMantineTheme();
  const isTablet = useIsTablet(theme);

  const isPlaceholder = !Object.keys(listing).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;
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
          <Title
            order={1}
            size="h4"
            truncate
            sx={{
              maxWidth: isTablet ? "auto" : "180px",
            }}
          >
            {address_name}
          </Title>
          <Badge
            color="pink"
            variant="light"
          >
            {listing_type}
          </Badge>
        </Group>
      </Skeleton>

      <Skeleton visible={isSkeleton}>
        <Text tt="capitalize">
          {sub_category_formatted ?? main_category}&nbsp;&middot;&nbsp;
          {attributes?.bedrooms_formatted}
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
