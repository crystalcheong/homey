import { Box, Button, useMantineTheme } from "@mantine/core";
import { NextPage } from "next/types";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores/ninetyNine";

import { Layout, Property } from "@/components";
import Hero from "@/components/Pages/Index/Hero";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const IndexPage: NextPage = () => {
  const theme = useMantineTheme();

  const allListings: Record<ListingType, Listing[]> =
    useNinetyNineStore.use.listings();
  const { rent: rentListings = [], sale: saleListings = [] } = allListings;

  const updateListings = useNinetyNineStore.use.updateListings();
  const getMoreListings = useNinetyNineStore.use.getMoreListings();

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
          enabled: !allListings[listingType].length,
          onSuccess(data) {
            if (!data.length) return;
            updateListings(listingType, data as Listing[]);
          },
        }
      )
    )
  );

  const handleLoadMoreListings = (listingType: ListingType) => {
    const isTypeLoading =
      listingType === "rent" ? isFetchingRentListings : isFetchingSaleListings;

    logger("handleLoadMoreListings", { listingType, isTypeLoading });

    if (isTypeLoading) return;
    getMoreListings(listingType);
  };

  logger("index.tsx line 39", {
    rentListings,
    saleListings,
  });
  return (
    <Layout.Base
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        "&> :not(:first-child)": {
          marginBottom: "10vh",
        },
      }}
    >
      <Hero />

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
              listings={allListings[type]}
              isLoading={isTypeLoading}
              maxViewableCount={3}
              showMoreCTA
            >
              <Box
                component="aside"
                mt={20}
              >
                <Button
                  onClick={() => handleLoadMoreListings(type)}
                  loading={isTypeLoading}
                  variant="gradient"
                  gradient={{
                    from: theme.primaryColor,
                    to: theme.colors.violet[3],
                    deg: 45,
                  }}
                >
                  Load More
                </Button>
              </Box>
            </Property.Grid>
          );
        })}
      </Box>
    </Layout.Base>
  );
};

export default IndexPage;
