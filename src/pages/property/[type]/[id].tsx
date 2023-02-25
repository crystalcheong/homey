import { Carousel } from "@mantine/carousel";
import {
  Box,
  Button,
  CopyButton,
  Grid,
  Group,
  Image,
  SimpleGrid,
  Skeleton,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import Autoplay from "embla-carousel-autoplay";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TbCheck, TbCurrentLocation, TbShare } from "react-icons/tb";
import superjson from "superjson";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
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
import { useIsMobile } from "@/utils/dom";
import { getLimitedArray } from "@/utils/helpers";

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

  await ssg.ninetyNine.getClusterListing.prefetch({
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

  const isMobile: boolean = useIsMobile(theme);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const listing: Listing | null = useNinetyNineStore.use.getListing()(type, id);

  const [modalOpened, setModalOpened] = useState<Listing["photos"][number]>();

  api.ninetyNine.getClusterListing.useQuery(
    {
      listingType: id,
      listingId: type,
      clusterId: clusterId,
    },
    {
      enabled: !listing && isValidProperty && isMounted,
      onSuccess(data) {
        logger("[id].tsx line 45/onSuccess", { data, clusterId, id, type });

        // if (!data) {
        //   router.push(`${router.basePath}/property/${type}`, undefined, {
        //     scroll: true,
        //   });
        // }
        useNinetyNineStore.setState(() => ({ currentListing: data }));
      },
    }
  );

  const autoplay = useRef(Autoplay({ delay: 2000 }));

  /**
   * @see https://nextjs.org/docs/messages/react-hydration-error
   */
  useEffect(() => {
    setIsMounted(true);
    logger("[id].tsx line 91", { listing, baseUrl: getBaseUrl() });
  }, [listing]);

  const PRIMARY_COL_HEIGHT = 300;
  const SECONDARY_COL_HEIGHT = PRIMARY_COL_HEIGHT / 2 - theme.spacing.md / 2;

  const details: {
    label: string;
    attribute: string;
  }[] = [
    {
      label: `Price/sqft`,
      attribute: `${listing?.attributes?.area_ppsf_formatted ?? "$-.-- psf"}`,
    },
    {
      label: `Built year`,
      attribute: `${listing?.attributes?.completed_at ?? "----"}`,
    },
    {
      label: `No. of Bedrooms`,
      attribute: `${listing?.attributes?.bedrooms ?? "--"}`,
    },
    {
      label: `Tenure`,
      attribute: `${listing?.attributes?.tenure ?? "--"}`,
    },
    {
      label: `Property type`,
      attribute: `${listing?.sub_category_formatted ?? "--"}`,
    },
    {
      label: `Last updated`,
      attribute: `${listing?.date_formatted ?? "--"}`,
    },
  ];

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
      >
        <Carousel
          withIndicators
          loop
          align="start"
          height={400}
          slideSize="50%"
          slideGap="sm"
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
          breakpoints={[
            { maxWidth: "md", slideSize: "50%", slideGap: "sm" },
            { maxWidth: "sm", slideSize: "100%", slideGap: 0 },
          ]}
          styles={{
            indicator: {
              width: 12,
              height: 4,
              transition: "width 250ms ease",

              "&[data-active]": {
                width: 40,
              },
            },
          }}
        >
          {(listing?.photos ?? []).reverse().map((photo, idx) => (
            <Carousel.Slide key={`tourSlide-${photo.id}-${idx}`}>
              <Image
                height={400}
                fit={isMobile ? "cover" : "cover"}
                src={photo.url}
                alt={photo.category}
                onClick={() => setModalOpened(photo)}
                sx={{
                  position: "relative",
                }}
                caption={<ImageCaption>{photo.category}</ImageCaption>}
              />
            </Carousel.Slide>
          ))}
        </Carousel>

        <Box
          component="section"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          <Group position="apart">
            <Title
              order={1}
              size="h3"
              sx={{
                wordBreak: "break-word",
              }}
            >
              {listing?.attributes?.bedrooms_formatted}
              &nbsp;in&nbsp;{listing?.address_name}
            </Title>
            <Title
              order={2}
              size="h4"
            >
              {listing?.attributes?.price_formatted ?? `$-.--`}{" "}
              {PriceListingTypes[listing?.listing_type ?? ListingTypes[0]]}
            </Title>
          </Group>

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
                position="apart"
                key={`detail-${label}`}
              >
                <Text
                  component="p"
                  weight={700}
                  py={0}
                  sx={{
                    lineHeight: 0,
                  }}
                >
                  {label}
                </Text>
                <Text>{attribute}</Text>
              </Group>
            ))}
          </SimpleGrid>

          {listing && (
            <Group position="apart">
              <EnquiryButtonGroup listing={listing} />

              <Group>
                <SaveButton
                  listing={listing}
                  showLabel
                  overwriteButtonProps={{
                    compact: false,
                  }}
                />

                <CopyButton
                  value={`${getBaseUrl()}/property/${type}/${id}?clusterId=${clusterId}`}
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
              </Group>
            </Group>
          )}
        </Box>

        <Box>
          <Button
            variant="outline"
            component={Link}
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${Object.values(
              listing?.location.coordinates ?? {}
            ).join(",")}&heading=-45&fov=80`}
            leftIcon={<TbCurrentLocation size={22} />}
          >
            Street View
          </Button>
        </Box>

        <Box>
          <Group position="apart">
            <Title
              order={3}
              size="h3"
              py="md"
            >
              Take a tour
            </Title>
            <Text
              component="p"
              fw={500}
              color={theme.fn.primaryColor()}
              onClick={() => setModalOpened(listing?.photos?.[0])}
            >
              See more
            </Text>
          </Group>
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
                  <Text
                    sx={{
                      position: "absolute",
                      bottom: "0.5em",
                      left: "0.5em",
                      padding: "0.2em",

                      background: `rgba(0,0,0,.4)`,
                      color: theme.white,
                    }}
                  >
                    {listing?.photos?.[0].category ?? ""}
                  </Text>
                }
              />
            </Skeleton>
            <Grid gutter="md">
              {getLimitedArray(listing?.photos.slice(1) ?? [], 3).map(
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
