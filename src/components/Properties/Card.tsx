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

import {
  Listing,
  ListingType,
  ListingTypes,
  NinetyNine,
} from "@/data/clients/ninetyNine";

import {
  ListingCardOrientation,
  ListingCardOrientations,
} from "@/components/Properties/Grid";
import SaveButton from "@/components/Properties/SaveButton";

import { getLimitedArray, useIsMobile } from "@/utils";

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
  orientation?: ListingCardOrientation;
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
  orientation = ListingCardOrientations[0],
  ...rest
}: Props) => {
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);

  const {
    id,
    listing_type,
    photo_url,
    attributes,
    main_category,
    address_name,
    formatted_tags,
  } = listing;

  const isPlaceholder = !Object.keys(listing).length;
  const isSkeleton: boolean = isLoading || isPlaceholder;
  const strPrice = `${attributes?.price_formatted ?? `$-.--`}`;

  const formattedTag = getLimitedArray(formatted_tags ?? [], 1)?.[0] ?? null;

  const isHorizontal: boolean = orientation === ListingCardOrientations[1];

  // logger('Card.tsx line 84', {
  //   orientation,
  //   isHorizontal,
  //   ViewOrientation,
  // })

  return (
    <MCard
      shadow="sm"
      p="sm"
      pb="xs"
      radius="md"
      withBorder
      component={Link}
      href={NinetyNine.getSourceHref(listing)}
      sx={(theme) => ({
        height: "100%",
        width: "100%",
        ...(isHorizontal &&
          !isMobile && {
            display: "flex",
            flexDirection: "row",
            gap: theme.spacing.xl,
            height: "220px",
          }),
      })}
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
            disabled={isLoading}
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
          height={isHorizontal && !isMobile ? 220 : 160}
          width={isHorizontal && !isMobile ? 300 : undefined}
          alt={id}
          fit="cover"
          withPlaceholder
          sx={{
            opacity: 1,
            objectPosition: "center",
          }}
        />
      </MCard.Section>

      <MCard.Section
        component="main"
        sx={{
          padding: "0 1em 1em",
          ...(isHorizontal &&
            !isMobile && {
              flex: 1,
              padding: "0 2em 1em",
            }),
        }}
      >
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

        {children}

        <Box component="aside">
          <Group
            mt={isHorizontal && !isMobile ? "xs" : "md"}
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
      </MCard.Section>
    </MCard>
  );
};

export default Card;
