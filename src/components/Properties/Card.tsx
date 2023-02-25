import {
  Card as MCard,
  CardProps,
  Group,
  Image,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { IconType } from "react-icons";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import EnquiryButtonGroup from "@/components/Properties/EnquiryButtonGroup";
import SaveButton from "@/components/Properties/SaveButton";

export const EnquiryTypes: string[] = ["call", "whatsapp"];
export type EnquiryType = (typeof EnquiryTypes)[number];
export const EnquiryIcons: Record<EnquiryType, IconType> = {
  [EnquiryTypes[0]]: FaPhoneAlt,
  [EnquiryTypes[1]]: FaWhatsapp,
};

interface Props extends Partial<CardProps> {
  listing: Listing;
  isLoading?: boolean;
  allowSaveListing?: boolean;
}

export const PriceTypes: string[] = ["/month", ""];
export type PriceType = (typeof PriceTypes)[number];
export const PriceListingTypes: {
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
  allowSaveListing = false,
  ...rest
}: Props) => {
  const {
    id,
    listing_type,
    photo_url,
    attributes,
    main_category,
    address_name,
    cluster_mappings,
  } = listing;

  const isPlaceholder = !Object.keys(listing).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;
  const strPrice = `${attributes?.price_formatted ?? `$-.--`} ${
    PriceListingTypes[listing_type]
  }`;

  const clusterId: string =
    cluster_mappings?.development?.[0] ?? cluster_mappings?.local?.[0] ?? "";
  const listingRelativeLink = `/property/${listing_type}/${id}?clusterId=${clusterId}`;

  return (
    <MCard
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      component={Link}
      href={listingRelativeLink}
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
            sx={
              {
                // maxWidth: isTablet ? "auto" : "180px",
              }
            }
          >
            {address_name}
          </Title>

          {/* <Badge
            color="pink"
            variant="light"
          >
            {listing_type}
          </Badge> */}
        </Group>
      </Skeleton>

      <Skeleton visible={isSkeleton}>
        <Text tt="capitalize">
          <Text
            tt="uppercase"
            component="span"
          >
            {main_category}
          </Text>
          &nbsp;&middot;&nbsp;
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

      <Group
        position="apart"
        sx={{
          position: "relative",
          zIndex: 100,
        }}
      >
        <EnquiryButtonGroup
          listing={listing}
          overwriteButtonProps={{
            compact: true,
          }}
        />
        {allowSaveListing && <SaveButton listing={listing} />}
      </Group>
    </MCard>
  );
};

export default Card;
