import { Box, useMantineTheme } from "@mantine/core";
import { NextPage } from "next/types";
import { useSession } from "next-auth/react";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";
import { meta } from "@/data/static";
import { useNinetyNineStore } from "@/data/stores/ninetyNine";

import { Layout, Property } from "@/components";
import Hero from "@/components/Pages/Index/Hero";

import { api } from "@/utils/api";
import { useIsTablet } from "@/utils/dom";

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
          listingType,
        },
        {
          enabled: !(allListings.get(listingType) ?? []).length,
          onSuccess(data) {
            if (!data.length) return;
            updateListings(listingType, data as Listing[]);
          },
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
        headline={meta.tagline}
        subHeading={meta.description}
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
