import {
  Accordion,
  Affix,
  Avatar,
  Badge,
  Box,
  Button,
  CopyButton,
  Grid,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { FaBirthdayCake } from "react-icons/fa";
import { MdOutlinePhotoLibrary } from "react-icons/md";
import {
  TbBath,
  TbBed,
  TbBuildingCommunity,
  TbCheck,
  TbClock,
  TbCurrentLocation,
  TbDimensions,
  TbEdit,
  TbShare,
} from "react-icons/tb";
import { TiChartAreaOutline } from "react-icons/ti";
import superjson from "superjson";

import { Cluster, Listing, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";
import {
  EnquiryButtonGroup,
  PriceListingTypes,
  SaveButton,
} from "@/components/Properties";
import GalleryModal, {
  ImageCaption,
} from "@/components/Properties/GalleryModal";

import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import { api, getBaseUrl } from "@/utils/api";
import { logger } from "@/utils/debug";
import { useIsTablet } from "@/utils/dom";
import { getLimitedArray } from "@/utils/helpers";

import EmptyListing from "~/assets/images/empty-listing.svg";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, type, clusterId } = context.query;

  const paramId: string = (id ?? "").toString();
  const isValidId: boolean = !!paramId.length ?? false;

  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (ListingTypes.includes(paramType) || !!paramType.length) ?? false;

  const paramClusterId: string = (clusterId ?? "").toString();
  const isValidClusterId: boolean = !!paramClusterId.length ?? false;

  const isValidProperty: boolean = isValidId && isValidType && isValidClusterId;

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {
      session: null,
      prisma: prisma,
    },
    transformer: superjson,
  });

  await ssg.ninetyNine.getClusterListings.prefetch({
    listingType: paramType,
    listingId: paramId,
    clusterId: paramClusterId,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: paramId,
      type: paramType,
      clusterId: paramClusterId,
      isValidProperty,
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const PropertyPage = ({ id, type, clusterId, isValidProperty }: Props) => {
  const theme = useMantineTheme();

  const isTablet: boolean = useIsTablet(theme);
  const isDark: boolean = theme.colorScheme === "dark" ?? false;

  const [scroll] = useWindowScroll();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const listing: Listing | null = useNinetyNineStore.use.getListing()(type, id);

  const [baseUrl, setBaseUrl] = useState<string>(getBaseUrl());
  const [modalOpened, setModalOpened] = useState<Listing["photos"][number]>();

  /**
   * @see https://nextjs.org/docs/messages/react-hydration-error
   */
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && window.location.origin)
      setBaseUrl(window.location.origin);
    logger("[id].tsx line 91", { listing });
  }, [listing]);

  const [{ data: listingData }] = api.useQueries((t) => [
    t.ninetyNine.getClusterListings(
      {
        listingType: type,
        listingId: id,
        clusterId,
      },
      {
        enabled: !listing && isValidProperty && isMounted,
      }
    ),
    t.ninetyNine.getCluster(
      {
        clusterId,
      },
      {
        enabled:
          !!listing && !!clusterId.length && isValidProperty && isMounted,
        onSuccess: (data) => {
          logger("[id].tsx line 140", { data });
          setCluster(data);
        },
      }
    ),
  ]);

  useMemo(() => {
    if (!listingData) return;
    useNinetyNineStore.setState(() => ({ currentListing: listingData }));
  }, [listingData]);

  const PRIMARY_COL_HEIGHT = 300;
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

  const details: {
    label: string;
    attribute: string;
    icon: IconType;
  }[] = [
    {
      label: `Bedrooms`,
      attribute: `${listing?.attributes?.bedrooms ?? "--"}`,
      icon: TbBed,
    },
    {
      label: `Bathrooms`,
      attribute: `${listing?.attributes?.bathrooms ?? "--"}`,
      icon: TbBath,
    },
    {
      label: `Living Space`,
      attribute: `${listing?.attributes?.area_size_sqm_formatted ?? "--"}`,
      icon: TbDimensions,
    },
    {
      label: `Tenure`,
      attribute: `${listing?.attributes?.tenure ?? "--"}`,
      icon: TbClock,
    },

    {
      label: `Price/sqft`,
      attribute: `${listing?.attributes?.area_ppsf_formatted ?? "$-.-- psf"}`,
      icon: TiChartAreaOutline,
    },
    {
      label: `Built year`,
      attribute: `${listing?.attributes?.completed_at ?? "----"}`,
      icon: FaBirthdayCake,
    },
    {
      label: `Property type`,
      attribute: `${listing?.main_category ?? "--"}`.toUpperCase(),
      icon: TbBuildingCommunity,
    },
    {
      label: `Last updated`,
      attribute: `${listing?.date_formatted ?? "--"}`,
      icon: TbEdit,
    },
  ];

  const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBeU0KYm091allUovk19s4Aw4KfI7l43aI&q=${encodeURIComponent(
    listing?.address_name ?? ""
  )}`;

  return (
    <Layout.Base
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <Provider.RenderGuard
        renderIf={isValidProperty && isMounted && !!listing}
        fallbackComponent={
          <UnknownState
            svgNode={<EmptyListing />}
            title="Listing not found"
            subtitle="Woops, the listing has vanished"
          />
        }
      >
        {/* HEADER */}
        <Box
          component={Paper}
          sx={{
            position: "sticky",
            top: "56px",
            padding: "1em 0 2em",
            zIndex: 20,
          }}
        >
          <Title
            order={1}
            size="h2"
          >
            {listing?.address_name}
          </Title>

          <Group position="apart">
            <Title
              order={2}
              size="p"
              color="dimmed"
              fw={400}
            >
              {listing?.address_line_2}
            </Title>

            <Group spacing="xs">
              <CopyButton
                value={`${baseUrl}/property/${type}/${id}?clusterId=${clusterId}`}
              >
                {({ copied, copy }) => (
                  <Button
                    color="primary"
                    onClick={copy}
                    variant="outline"
                    leftIcon={
                      copied ? <TbCheck size={16} /> : <TbShare size={16} />
                    }
                  >
                    {copied ? "Link copied" : "Share"}
                  </Button>
                )}
              </CopyButton>

              <Button
                variant="outline"
                component={Link}
                target="_blank"
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${Object.values(
                  listing?.location.coordinates ?? {}
                ).join(",")}&heading=-45&fov=80`}
                leftIcon={<TbCurrentLocation size={16} />}
              >
                Street View
              </Button>

              {listing && (
                <SaveButton
                  listing={listing}
                  showLabel
                  overwriteButtonProps={{
                    compact: false,
                  }}
                />
              )}
            </Group>
          </Group>
        </Box>

        {/* GALLERY GRID */}
        <Box
          sx={{
            position: "relative",
          }}
        >
          <Button
            variant="white"
            leftIcon={<MdOutlinePhotoLibrary size={16} />}
            onClick={() => setModalOpened(listing?.photos?.[0])}
            styles={(theme) => ({
              root: {
                position: "absolute",
                bottom: theme.spacing.xs,
                right: theme.spacing.xl,
                zIndex: 10,
              },
            })}
          >
            View all photos
          </Button>
          <SimpleGrid
            cols={2}
            spacing="md"
            breakpoints={[{ maxWidth: "sm", cols: 1 }]}
          >
            <Skeleton
              visible={!listing?.photos?.[0]}
              height={PRIMARY_COL_HEIGHT}
              radius="md"
              animate={false}
            >
              <Image
                radius="md"
                height={PRIMARY_COL_HEIGHT}
                src={listing?.photos?.[0]?.url ?? null}
                alt={listing?.photos?.[0]?.category}
                onClick={() => setModalOpened(listing?.photos?.[0])}
                caption={
                  <ImageCaption>
                    {listing?.photos?.[0]?.category ?? ""}
                  </ImageCaption>
                }
              />
            </Skeleton>
            <Grid gutter="md">
              {getLimitedArray((listing?.photos ?? []).slice(1) ?? [], 3).map(
                (photo, idx) => (
                  <Grid.Col
                    key={`tourGrid-${photo.id}-${idx}`}
                    span={idx > 0 ? 6 : 12}
                  >
                    <Skeleton
                      visible={!photo?.url}
                      height={SECONDARY_COL_HEIGHT}
                      radius="md"
                      animate={false}
                    >
                      <Image
                        radius="md"
                        height={SECONDARY_COL_HEIGHT}
                        src={photo?.url ?? null}
                        alt={photo?.category ?? ""}
                        onClick={() => setModalOpened(photo)}
                        sx={{
                          position: "relative",
                        }}
                        caption={<ImageCaption>{photo?.category}</ImageCaption>}
                      />
                    </Skeleton>
                  </Grid.Col>
                )
              )}
            </Grid>
          </SimpleGrid>
        </Box>

        <Group>
          {getLimitedArray(details, 4).map(
            ({ label, attribute, icon: AttrIcon }, idx) => (
              <Box
                key={`detail-${label}-${idx}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  placeContent: "start",
                  placeItems: "start",
                  gap: "0.5em",
                }}
              >
                <Text
                  component="p"
                  size="sm"
                  truncate
                  tt="capitalize"
                  m={0}
                >
                  {label}
                </Text>
                <Group spacing="xs">
                  <AttrIcon
                    size={20}
                    color={theme.fn.primaryColor()}
                  />
                  <Text
                    component="p"
                    size="sm"
                    fw={800}
                    m={0}
                    truncate
                  >
                    {attribute}
                  </Text>
                </Group>
              </Box>
            )
          )}

          <Title
            order={2}
            size="p"
            color="dimmed"
            weight={400}
            fz="sm"
            sx={{
              marginLeft: "auto",
              textAlign: "center",
            }}
          >
            <Text
              component="span"
              weight={800}
              fz="xl"
              variant="gradient"
            >
              {listing?.attributes?.price_formatted ?? `$-.--`}&nbsp;
            </Text>
            {PriceListingTypes[listing?.listing_type ?? ListingTypes[0]]}
          </Title>
        </Group>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          <Title order={3}>About this home</Title>
          <Group spacing="sm">
            {(listing?.formatted_tags ?? []).map((tag, idx) => (
              <Badge
                key={`${id}-${idx}-${tag?.color}`}
                radius="sm"
                tt="uppercase"
                variant="gradient"
              >
                {tag?.text}
              </Badge>
            ))}
          </Group>

          <Text
            color="dimmed"
            component="p"
            size="md"
            fs={cluster?.description?.length ? "normal" : "italic"}
          >
            {cluster?.description ?? "No description available"}
          </Text>
        </Box>

        <Accordion defaultValue="information">
          <Accordion.Item value="information">
            <Accordion.Control>
              <Title order={4}>Information</Title>
            </Accordion.Control>
            <Accordion.Panel>
              <SimpleGrid
                cols={2}
                spacing="xl"
                breakpoints={[
                  { maxWidth: "md", cols: 2, spacing: "lg" },
                  { maxWidth: "xs", cols: 1, spacing: "sm" },
                ]}
              >
                {details.map(({ label, attribute }) => (
                  <Group
                    position="left"
                    key={`detail-${label}`}
                  >
                    <Text
                      component="p"
                      size="sm"
                      weight={400}
                      py={0}
                      lh={0}
                    >
                      {label}
                    </Text>
                    <Text
                      component="p"
                      size="sm"
                      color="dimmed"
                    >
                      {attribute}
                    </Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Box
          component="iframe"
          width="100%"
          height="500"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapsUrl.toString()}
          sx={{
            border: 0,
            borderRadius: theme.radius.md,
          }}
        />

        {listing?.user && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.sm,
              background: theme.fn.gradient(),
              padding: theme.spacing.sm,
              borderRadius: theme.radius.sm,
              position: "relative",

              "&::before": {
                background: isDark ? theme.black : theme.white,
                content: '""',
                position: "absolute",
                inset: "2px",
                zIndex: 1,
                borderRadius: theme.radius.xs,
              },

              "&>*": {
                position: "relative",
                zIndex: 2,
              },
            }}
          >
            <Text
              component="p"
              fw={600}
              m={0}
            >
              Listed by
            </Text>
            <Group position="apart">
              <Group>
                <Avatar
                  src={listing?.user?.photo_url}
                  alt="User Avatar"
                  radius="xl"
                  size="md"
                />
                <Text
                  component="p"
                  fw={600}
                >
                  {listing?.user?.name}
                </Text>
              </Group>

              <Group spacing="xs">
                <EnquiryButtonGroup
                  listing={listing}
                  hideLabels={isTablet}
                />
              </Group>
            </Group>
          </Box>
        )}

        <Text
          component="p"
          color="dimmed"
          size="xs"
        >
          You agree to Homey's Terms of Use & Privacy Policy. By choosing to
          contact a property, you also agree that Homey Group, landlords, and
          property managers may call or text you about any inquiries you submit
          through our services, which may involve use of automated means and
          prerecorded/artificial voices. You don't need to consent as a
          condition of renting any property, or buying any other goods or
          services. Message/data rates may apply.
        </Text>

        <Affix position={{ bottom: 20, left: 20 }}>
          <Transition
            transition="slide-up"
            mounted={scroll.y > 0}
          >
            {(transitionStyles) => (
              <Group style={transitionStyles}>
                <EnquiryButtonGroup
                  listing={listing ?? ({} as Listing)}
                  overwriteIconProps={{
                    color: theme.white,
                  }}
                  overwriteButtonProps={{
                    variant: "filled",
                  }}
                />
              </Group>
            )}
          </Transition>
        </Affix>

        <GalleryModal
          photos={listing?.photos ?? []}
          opened={!!modalOpened}
          activePhoto={modalOpened}
          onClose={() => setModalOpened(undefined)}
          dispatchState={setModalOpened}
        />
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default PropertyPage;
