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
import dynamic from "next/dynamic";
import Link from "next/link";
import { TbBed, TbResize } from "react-icons/tb";

const SaveButton = dynamic(() => import("@/components/Properties/SaveButton"));

import { NinetyNine } from "@/data/clients/ninetyNine";

import { getLimitedArray, useIsMobile } from "@/utils";

import {
  Listing,
  ListingCardOrientation,
  ListingCardOrientations,
  PriceListingTypes,
} from "@/types/ninetyNine";

interface Props extends Partial<CardProps> {
  listing: Listing;
  isLoading?: boolean;
  allowSaveListing?: boolean;
  orientation?: ListingCardOrientation;
}

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
    type,
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
        <Badge
          hidden={!formattedTag}
          key={`${id}-${formattedTag?.color ?? "color"}`}
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

        <SaveButton
          hidden={!allowSaveListing}
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
              &nbsp;{PriceListingTypes[type]}
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

            <Group
              spacing="xs"
              hidden={!attributes?.area_size_formatted}
            >
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
          </Group>
        </Box>
      </MCard.Section>
    </MCard>
  );
};

export default Card;
