import { Box, Button, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";
import {
  defaultPaginationInfo,
  PaginationInfo,
  useNinetyNineStore,
} from "@/data/stores";

import { Layout, Property, Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const PropertyTypePage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { type, location } = router.query;

  const { data: sessionData } = useSession();

  const isAuth = !!sessionData;

  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (ListingTypes.includes(paramType) && !!paramType.length) ?? false;

  const listingType: ListingType = paramType;

  const listings: Listing[] =
    useNinetyNineStore.use.listings().get(listingType) ?? [];
  const pagination: PaginationInfo =
    useNinetyNineStore.use.pagination().get(listingType) ??
    defaultPaginationInfo;

  const updateListings = useNinetyNineStore.use.updateListings();

  const { isFetching: isLoading, refetch } =
    api.ninetyNine.getListings.useQuery(
      {
        listingType,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
      },
      {
        enabled: !listings.length && isValidType,
        onSuccess(data) {
          if (!data.length) return;
          updateListings(listingType, data as Listing[]);
          logger("index.tsx line 46", { pagination });
        },
      }
    );

  const handleLoadMoreListings = () => {
    if (isLoading) return;
    refetch();
  };

  logger("index.tsx line 49", { location });

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={isValidType}>
        <Property.Grid
          listings={listings}
          isLoading={isLoading}
          allowSaveListing={isAuth}
        >
          <Box
            component="aside"
            mt={20}
          >
            <Button
              onClick={handleLoadMoreListings}
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
