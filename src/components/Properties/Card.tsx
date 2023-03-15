import {
  Badge,
  Box,
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
import { IconType } from "react-icons";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { TbBed, TbResize } from "react-icons/tb";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import SaveButton from "@/components/Properties/SaveButton";

import { getLimitedArray } from "@/utils/helpers";

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
  const theme = useMantineTheme();

  const {
    id,
    listing_type,
    photo_url,
    attributes,
    main_category,
    address_name,
    cluster_mappings,
    formatted_tags,
  } = listing;

  const isPlaceholder = !Object.keys(listing).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;
  const strPrice = `${attributes?.price_formatted ?? `$-.--`}`;

  const clusterId: string =
    cluster_mappings?.development?.[0] ?? cluster_mappings?.local?.[0] ?? "";
  const listingRelativeLink = `/property/${listing_type}/${id}?clusterId=${clusterId}`;

  const formattedTag = getLimitedArray(formatted_tags ?? [], 1)?.[0] ?? null;

  return (
    <MCard
      shadow="sm"
      p="sm"
      pb="xs"
      radius="md"
      withBorder
      component={Link}
      href={listingRelativeLink}
      {...rest}
    >
      <MCard.Section
        sx={{
          position: "relative",
        }}
      >
        {!!formattedTag && (
          <Badge
            key={`${id}-${formattedTag.color}`}
            radius="xs"
            variant="gradient"
            tt="uppercase"
            styles={(theme) => ({
              root: {
                position: "absolute",
                bottom: -theme.spacing.xs,
                left: 0,
                zIndex: 10,

                borderTopRightRadius: theme.radius.sm,
                borderBottomRightRadius: theme.radius.sm,
              },
            })}
          >
            {formattedTag?.text}
          </Badge>
        )}

        {allowSaveListing && (
          <SaveButton
            listing={listing}
            overwriteIconProps={{
              size: 30,
            }}
            sx={{
              position: "absolute",
              top: theme.spacing.xs,
              right: theme.spacing.xs,
              zIndex: 10,
            }}
          />
        )}

        <Image
          src={photo_url}
          height={160}
          alt={id}
          fit="cover"
          withPlaceholder
          sx={{
            opacity: 1,
          }}
        />
      </MCard.Section>

      <Skeleton visible={isSkeleton}>
        <Group
          position="apart"
          mt="xl"
          mb="xs"
          spacing="xs"
        >
          <Title
            order={3}
            size="p"
            color="dimmed"
            weight={400}
            fz="sm"
          >
            <Text
              component="span"
              weight={800}
              fz="xl"
              variant="gradient"
            >
              {strPrice}
            </Text>
            &nbsp;{PriceListingTypes[listing_type]}
          </Title>

          <Badge>{main_category}</Badge>
        </Group>

        <Title
          order={2}
          size="h4"
          truncate
        >
          {address_name}
        </Title>
      </Skeleton>

      <Skeleton visible={isSkeleton}></Skeleton>

      {children}

      {/* <Group
        position="apart"
        mt="lg"
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
        {allowSaveListing && (
          <SaveButton
            listing={listing}
            overwriteIconProps={{
              size: 30,
            }}
          />
        )}
      </Group> */}

      <Box>
        <Group
          mt="md"
          spacing="xs"
        >
          <Group spacing="xs">
            <TbBed
              size={16}
              color={theme.fn.primaryColor()}
            />
            <Text
              component="p"
              fz="xs"
              truncate
            >
              {attributes?.bedrooms ?? 0} Beds
            </Text>
          </Group>
          <Group spacing="xs">
            <TbBed
              size={16}
              color={theme.fn.primaryColor()}
            />
            <Text
              component="p"
              fz="xs"
              truncate
            >
              {attributes?.bathrooms ?? 0} Baths
            </Text>
          </Group>

          {!!attributes?.area_size_formatted && (
            <Group spacing="xs">
              <TbResize
                size={16}
                color={theme.fn.primaryColor()}
              />
              <Text
                component="p"
                fz="xs"
                truncate
              >
                {attributes?.area_size_formatted}
              </Text>
            </Group>
          )}
        </Group>
      </Box>
    </MCard>
  );
};

export default Card;
