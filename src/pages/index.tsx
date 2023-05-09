import { Box, useMantineTheme } from "@mantine/core";
import dynamic from "next/dynamic";
import { NextPage } from "next/types";
import { useSession } from "next-auth/react";

import { Metadata } from "@/data/static";
import {
  defaultPaginationInfo,
  useNinetyNineStore,
} from "@/data/stores/ninetyNine";

import { Layout, Property } from "@/components";
const Hero = dynamic(() => import("@/components/Pages/Index/Hero"));

import { api, useIsTablet } from "@/utils";

import {
  Listing,
  ListingType,
  ListingTypes,
  NinetyNineListing,
} from "@/types/ninetyNine";

const IndexPage: NextPage = () => {
  const theme = useMantineTheme();
  const isTablet = useIsTablet(theme);
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const allListings: Map<ListingType, Listing[]> =
    useNinetyNineStore.use.listings();
  const updateListings = useNinetyNineStore.use.updateListings();

  const [
    { isFetching: isFetchingRentListings },
    { isFetching: isFetchingSaleListings },
  ] = api.useQueries((t) =>
    ListingTypes.map((listingType) =>
      t.ninetyNine.getListings(
        {
          listingType: listingType,
        },
        {
          enabled:
            (allListings.get(listingType) ?? []).length <
            defaultPaginationInfo.pageSize,
          onSuccess: (data: NinetyNineListing[]) => {
            if (!data.length) return;
            updateListings(listingType, data as Listing[]);
          },
          placeholderData: [],
          retry: 2,
        }
      )
    )
  );

  return (
    <Layout.Base
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <Hero
        headline={Metadata.tagline}
        subHeading={Metadata.description}
      />

      <Box
        component="section"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.xl,
        }}
      >
        {ListingTypes.map((type, idx) => {
          const isTypeLoading =
            type === "rent" ? isFetchingRentListings : isFetchingSaleListings;

          return (
            <Property.Grid
              key={`grid-${type}-${idx}`}
              listings={allListings.get(type) ?? []}
              isLoading={isTypeLoading}
              maxViewableCount={isTablet ? 4 : 3}
              placeholderCount={isTablet ? 4 : 3}
              allowSaveListing={isAuth}
              showMoreCTA
            />
          );
        })}
      </Box>
    </Layout.Base>
  );
};

export default IndexPage;
