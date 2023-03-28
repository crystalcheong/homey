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
  Indicator,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Tabs,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
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

import { Layout, Property, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";
import {
  EnquiryButtonGroup,
  PriceListingTypes,
  SaveButton,
} from "@/components/Properties";
import GalleryModal, {
  ImageCaption,
} from "@/components/Properties/GalleryModal";

import {
  getCategoryContent,
  getCategoryIcon,
} from "@/pages/explore/neighbourhoods/[name]";
import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";
import {
  api,
  getBaseUrl,
  getLimitedArray,
  getReplacedStringDelimiter,
  getStringWithoutAffix,
  logger,
  toTitleCase,
  useIsMobile,
  useIsTablet,
} from "@/utils";

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
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const isMobile: boolean = useIsMobile(theme);
  const isTablet: boolean = useIsTablet(theme);
  const isDark: boolean = theme.colorScheme === "dark" ?? false;

  const [scroll] = useWindowScroll();

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [baseUrl, setBaseUrl] = useState<string>(getBaseUrl());
  const [modalOpened, setModalOpened] = useState<Listing["photos"][number]>();

  const listing: Listing | null = useNinetyNineStore.use.getListing()(type, id);
  const updateCurrentListing = useNinetyNineStore.use.updateCurrentListing();
  const removeListing = useNinetyNineStore.use.removeListing();
  const updateListings = useNinetyNineStore.use.updateListings();

  const neighbourhood: string = getStringWithoutAffix(
    listing?.cluster_mappings?.zone[0] ?? "",
    "zo"
  );

  const neighbourhoods = useNinetyNineStore.use.neighbourhoods();

  const isValidNeighbourhood: boolean =
    (Object.keys(neighbourhoods).includes(neighbourhood) ||
      !!neighbourhood.length) ??
    false;

  /**
   * @see https://nextjs.org/docs/messages/react-hydration-error
   */
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined" && window.location.origin)
      setBaseUrl(window.location.origin);

    logger("[id].tsx line 132", { listing });
  }, [listing]);

  const [
    { data: listingData = null },
    ,
    { data: listingsData = [], isFetching: isLoadingListings },
    { data: neighbourhoodData },
  ] = api.useQueries((t) => [
    t.ninetyNine.getClusterListings(
      {
        listingType: type,
        listingId: id,
        clusterId,
      },
      {
        enabled: !listing && isValidProperty && isMounted,
        onSuccess: (data) => {
          logger("[id].tsx line 140", { data });
          if (!data) {
            removeListing(type, id);
            return;
          }

          updateCurrentListing(data);
        },
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
          logger("[id].tsx line 161", { data });
          setCluster(data);
        },
      }
    ),
    t.ninetyNine.getZoneListings(
      {
        listingType: type,
        zoneId: listing?.cluster_mappings?.zone[0] ?? "",
        listingCategory: listing?.main_category ?? "",
      },
      {
        enabled: !!listing && isValidProperty && isMounted,
        onSuccess: (data) => {
          if (!data.length) return;

          const isZonal = true;
          logger("[id].tsx line 179", { data });
          updateListings(type, data as Listing[], isZonal);
        },
      }
    ),
    t.ninetyNine.getNeighbourhood(
      {
        name: neighbourhood,
      },
      {
        enabled: isValidNeighbourhood,
      }
    ),
  ]);

  const PRIMARY_COL_HEIGHT = 300;
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

  const details: {
    label: string;
    attribute: string;
    icon: IconType;
  }[] = [
    {
      label: `Bedrooms`,
      attribute: `${listingData?.attributes?.bedrooms ?? "--"}`,
      icon: TbBed,
    },
    {
      label: `Bathrooms`,
      attribute: `${listingData?.attributes?.bathrooms ?? "--"}`,
      icon: TbBath,
    },
    {
      label: `Living Space`,
      attribute: `${listingData?.attributes?.area_size_sqm_formatted ?? "--"}`,
      icon: TbDimensions,
    },
    {
      label: `Tenure`,
      attribute: `${listingData?.attributes?.tenure ?? "--"}`,
      icon: TbClock,
    },

    {
      label: `Price/sqft`,
      attribute: `${
        listingData?.attributes?.area_ppsf_formatted ?? "$-.-- psf"
      }`,
      icon: TiChartAreaOutline,
    },
    {
      label: `Built year`,
      attribute: `${listingData?.attributes?.completed_at ?? "----"}`,
      icon: FaBirthdayCake,
    },
    {
      label: `Property type`,
      attribute: `${listingData?.main_category ?? "--"}`.toUpperCase(),
      icon: TbBuildingCommunity,
    },
    {
      label: `Last updated`,
      attribute: `${listingData?.date_formatted ?? "--"}`,
      icon: TbEdit,
    },
  ];

  const faqs: {
    question: string;
    answer: ReactNode;
  }[] = [
    {
      question: "How do I view this listing?",
      answer: (
        <>
          You can view this listing at{" "}
          <Text
            component="span"
            variant="gradient"
          >
            {listingData?.address_name}
          </Text>{" "}
          by clicking on the 'Call' or 'WhatsApp' button.
          <br />
          The agent will get in touch with you.
        </>
      ),
    },
    {
      question: `What is the price of this ${type} listing?`,
      answer: (
        <>
          The {type} price of this listing is{" "}
          <Text
            component="span"
            variant="gradient"
          >
            {listingData?.attributes?.price_formatted ?? `$-.--`}
            {PriceListingTypes[listingData?.listing_type ?? ListingTypes[0]]}
          </Text>
          .
        </>
      ),
    },
    {
      question: `What is the size of this listing?`,
      answer: (
        <>
          The size of this listing is&nbsp;
          <Text
            component="span"
            variant="gradient"
          >
            {listingData?.attributes?.area_size_sqm_formatted ?? "--"}
          </Text>
          &nbsp;or&nbsp;
          <Text
            component="span"
            variant="gradient"
          >
            {listingData?.attributes?.area_size_formatted ?? "--"}
          </Text>
          .
        </>
      ),
    },
    {
      question: `When was this listing built?`,
      answer: (
        <>
          This listing was built in&nbsp;
          <Text
            component="span"
            variant="gradient"
          >
            {listingData?.attributes?.completed_at ?? "--"}
          </Text>
        </>
      ),
    },
  ];

  const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBeU0KYm091allUovk19s4Aw4KfI7l43aI&q=${encodeURIComponent(
    listingData?.address_name ?? ""
  )}`;

  const neighbourhoodName: string = toTitleCase(
    getReplacedStringDelimiter(neighbourhood, "_", " ")
  );
  const neighbourhoodListingsUrl = neighbourhood.length
    ? `/property/${type}?${new URLSearchParams({
        location: JSON.stringify([neighbourhood]),
      })}`
    : "";

  // const neighbourhoodUrl = `/explore/neighbourhoods/${neighbourhood}`;

  return (
    <Layout.Base
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <Provider.RenderGuard
        renderIf={isValidProperty && isMounted && !!listingData}
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
            {listingData?.address_name}
          </Title>

          <Group position="apart">
            <Title
              order={2}
              size="p"
              color="dimmed"
              fw={400}
            >
              {listingData?.address_line_2}
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
                  listingData?.location.coordinates ?? {}
                ).join(",")}&heading=-45&fov=80`}
                leftIcon={<TbCurrentLocation size={16} />}
              >
                Street View
              </Button>

              {listingData && (
                <SaveButton
                  listing={listingData}
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
            onClick={() => setModalOpened(listingData?.photos?.[0])}
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
              visible={!listingData?.photos?.[0]}
              height={PRIMARY_COL_HEIGHT}
              radius="md"
              animate={false}
            >
              <Image
                radius="md"
                height={PRIMARY_COL_HEIGHT}
                src={listingData?.photos?.[0]?.url ?? null}
                alt={listingData?.photos?.[0]?.category}
                onClick={() => setModalOpened(listingData?.photos?.[0])}
                caption={
                  <ImageCaption>
                    {listingData?.photos?.[0]?.category ?? ""}
                  </ImageCaption>
                }
              />
            </Skeleton>
            <Grid gutter="md">
              {getLimitedArray(
                (listingData?.photos ?? []).slice(1) ?? [],
                3
              ).map((photo, idx) => (
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
              ))}
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
              {listingData?.attributes?.price_formatted ?? `$-.--`}&nbsp;
            </Text>
            {PriceListingTypes[listingData?.listing_type ?? ListingTypes[0]]}
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
            {(listingData?.formatted_tags ?? []).map((tag, idx) => (
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

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          <Title order={3}>Information</Title>
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
        </Box>

        {listingData?.user && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.sm,
              background: theme.fn.gradient(),
              padding: theme.spacing.lg,
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
              m={0}
              color="dimmed"
            >
              Listed by
            </Text>
            <Group position="apart">
              <Group>
                <Indicator
                  inline
                  size={16}
                  offset={3}
                  position="bottom-end"
                  withBorder
                  processing
                >
                  <Avatar
                    src={listingData?.user?.photo_url}
                    alt="User Avatar"
                    radius="xl"
                    size="md"
                  />
                </Indicator>

                <Text
                  component="p"
                  fw={600}
                  tt="capitalize"
                >
                  {listingData?.user?.name}
                </Text>
              </Group>

              <Group spacing="xs">
                <EnquiryButtonGroup
                  listing={listingData}
                  hideLabels={isTablet}
                />
              </Group>
            </Group>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          <Title order={3}>Location</Title>
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

          {!!neighbourhood.length && (
            <Text
              component={Link}
              href={neighbourhoodListingsUrl}
              size="sm"
              fw={500}
              variant="gradient"
            >
              See more listings in {neighbourhoodName}
            </Text>
          )}

          <Tabs
            hidden={true}
            defaultValue="subway_station"
            orientation={isMobile ? "horizontal" : "vertical"}
            variant="pills"
            styles={{
              root: {
                border: `1px solid ${theme.fn.primaryColor()}`,
                borderRadius: theme.radius.md,
              },
              tab: {
                display: "flex",
                flexDirection: "row",
                placeContent: "space-between",
                placeItems: "center",
              },
              tabsList: {
                ...(isMobile && {
                  flexWrap: "nowrap",
                  overflowX: "scroll",
                  scrollSnapType: "x mandatory",
                  "&>*": {
                    scrollSnapAlign: "start",
                  },
                }),
              },
            }}
          >
            <Tabs.List grow>
              {(neighbourhoodData?.categories ?? []).map((category) => {
                const categoryData = category.data ?? [];
                if (!categoryData.length) return null;
                const CategoryIcon = getCategoryIcon[category.key];

                return (
                  <Tabs.Tab
                    key={`tabTitle-${category.key}`}
                    value={category.key}
                    icon={<CategoryIcon size={16} />}
                    aria-label={category.name}
                    rightSection={
                      <Badge
                        w={16}
                        h={16}
                        sx={{ pointerEvents: "none" }}
                        variant="gradient"
                        size="xs"
                        p={0}
                      >
                        {(category.data ?? []).length}
                      </Badge>
                    }
                  >
                    {category.name}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>

            {(neighbourhoodData?.categories ?? []).map((category) => {
              const categoryData = category.data ?? [];
              if (!categoryData.length) return null;
              return (
                <Tabs.Panel
                  key={`tabPanel-${category.key}`}
                  value={category.key}
                >
                  <ScrollArea
                    h={400}
                    type="never"
                    offsetScrollbars
                    scrollbarSize={2}
                    p="md"
                  >
                    {categoryData.map((data) =>
                      getCategoryContent(category.key, data)
                    )}
                  </ScrollArea>
                </Tabs.Panel>
              );
            })}
          </Tabs>
        </Box>

        <Property.Grid
          title="Similar"
          listings={listingsData ?? []}
          isLoading={isLoadingListings}
          maxViewableCount={isTablet ? 4 : 3}
          placeholderCount={isTablet ? 4 : 3}
          allowSaveListing={isAuth}
          seeMoreLink={neighbourhoodListingsUrl}
          showMoreCTA
        />

        <Accordion
          defaultValue={`faq-${0}`}
          display={listing ? "block" : "none"}
        >
          {faqs.map((faq, idx) => (
            <Accordion.Item
              key={`faq-${idx}`}
              value={`faq-${idx}`}
            >
              <Accordion.Control>
                <Title order={4}>{faq.question}</Title>
              </Accordion.Control>
              <Accordion.Panel>{faq.answer}</Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>

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
                  listing={listingData ?? ({} as Listing)}
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
          photos={listingData?.photos ?? []}
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
