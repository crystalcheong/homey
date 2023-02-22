import { Box, Button, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores";

import { Layout, Property, Provider } from "@/components";

import { api } from "@/utils/api";

const PropertyTypePage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { type } = router.query;

  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (ListingTypes.includes(paramType) && !!paramType.length) ?? false;

  const listingType: ListingType = paramType;
  const listings: Listing[] =
    useNinetyNineStore.use.listings().get(listingType) ?? [];
  const updateListings = useNinetyNineStore.use.updateListings();
  const getMoreListings = useNinetyNineStore.use.getMoreListings();

  const { isFetching: isLoading } = api.ninetyNine.getListings.useQuery(
    {
      listingType,
    },
    {
      enabled: !listings.length && isValidType,
      onSuccess(data) {
        if (!data.length) return;
        updateListings(listingType, data as Listing[]);
      },
    }
  );

  const handleLoadMoreListings = (listingType: ListingType) => {
    if (isLoading) return;
    getMoreListings(listingType);
  };

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isValidType}>
        <Property.Grid
          listings={listings}
          isLoading={isLoading}
        >
          <Box
            component="aside"
            mt={20}
          >
            <Button
              onClick={() => handleLoadMoreListings(listingType)}
              loading={isLoading}
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
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default PropertyTypePage;
