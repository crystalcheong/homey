import { Box, Button, Chip, Group, Text, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";

import {
  Listing,
  ListingCategories,
  ListingCategory,
  ListingType,
  ListingTypes,
} from "@/data/clients/ninetyNine";
import {
  defaultListingMap,
  defaultPaginationInfo,
  PaginationInfo,
  useNinetyNineStore,
} from "@/data/stores";

import { Layout, Property, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

import EmptySearch from "~/assets/images/empty-search.svg";

const getZoneIds = (locations: string[]) =>
  locations
    .map((location: string) => `zo${location.replace(/-/g, "_")}`)
    .toString();

const getLocations = (paramLocation: string) => {
  let locations: string[] = [];
  if (!paramLocation.length) return locations;

  try {
    locations = JSON.parse(paramLocation) ?? [];
  } catch (e) {
    return locations;
  }
  return locations;
};

const PropertyTypePage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { type, location, category } = router.query;

  const { data: sessionData } = useSession();

  const isAuth = !!sessionData;

  const paramType: string = (type ?? "").toString();
  const isValidType: boolean =
    (ListingTypes.includes(paramType) && !!paramType.length) ?? false;

  const paramCategory: string = (category ?? "")
    .toString()
    .replace(/^"(.+(?="$))"$/, "$1");
  const isValidCategory: boolean =
    (ListingCategories.includes(paramCategory) && !!paramCategory.length) ??
    false;

  const paramLocation: string = (location ?? "").toString();
  const [locations, setLocations] = useState<string[]>([]);
  const paramLocations: string[] = useMemo(() => {
    const locationList = getLocations(paramLocation);
    setLocations(locationList);
    return locationList;
  }, [paramLocation]);
  const zoneIds: string = useMemo(() => getZoneIds(locations), [locations]);
  const isZonal = !!zoneIds.length;

  const listingType: ListingType = paramType;
  const listingCategory: ListingCategory = paramCategory;
  const listingsKey = isZonal ? "queryListings" : "listings";

  const listings: Listing[] =
    (useNinetyNineStore.use[listingsKey]() ?? defaultListingMap).get(
      listingType
    ) ?? [];
  const pagination: PaginationInfo =
    useNinetyNineStore.use.pagination().get(listingType) ??
    defaultPaginationInfo;

  const getFilteredListings = useCallback(
    (listings: Listing[]) => {
      let filteredListings: Listing[] = listings ?? [];
      if (listingCategory.length)
        filteredListings = filteredListings.filter(
          ({ main_category }) =>
            main_category.toLowerCase() === listingCategory.toLowerCase()
        );
      if (zoneIds.length)
        filteredListings = filteredListings.filter(({ cluster_mappings }) =>
          zoneIds.includes(cluster_mappings?.zone?.[0] ?? "")
        );

      return filteredListings;
    },
    [zoneIds, listingCategory]
  );

  const viewableListings = useMemo(
    () => getFilteredListings(listings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listings, zoneIds, listingCategory]
  );

  const updateListings = useNinetyNineStore.use.updateListings();

  const { isFetching: isLoading, refetch } =
    api.ninetyNine.getZoneListings.useQuery(
      {
        listingType,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        zoneId: zoneIds,
        listingCategory,
      },
      {
        enabled:
          (isValidType || isValidCategory) &&
          viewableListings.length < pagination.pageSize &&
          pagination.hasNext,
        onSuccess(data) {
          logger("index.tsx line 89/getZoneListings/onSuccess", {
            data,
            locations,
            paramLocations,
            defaultListingMap,
          });

          if (!data.length) return;

          updateListings(listingType, data as Listing[], isZonal);
        },
      }
    );

  const handleLoadMoreListings = () => {
    if (isLoading) return;
    refetch();
  };

  return (
    <Layout.Base showAffix={!!listings.length}>
      <Provider.RenderGuard renderIf={isValidType}>
        <Property.Grid
          listings={viewableListings}
          isLoading={isLoading}
          allowSaveListing={isAuth}
          title={listingType}
          subtitle={
            paramLocations.length ? (
              <Group
                align="center"
                mb={theme.spacing.xl}
              >
                <Text
                  component="p"
                  size="sm"
                  color="dimmed"
                  fw={500}
                >
                  Locations (
                  <Text
                    component="span"
                    size="sm"
                    color={theme.fn.primaryColor()}
                    fw={800}
                  >
                    {locations.length}
                  </Text>
                  ):
                </Text>
                <Chip.Group
                  multiple
                  defaultValue={locations}
                  onChange={setLocations}
                  align="center"
                  position="left"
                >
                  {paramLocations.map((location) => (
                    <Chip
                      key={`chip-${location}`}
                      value={location}
                      tt="capitalize"
                    >
                      {location.replace(/-/g, " ")}
                    </Chip>
                  ))}
                </Chip.Group>
              </Group>
            ) : undefined
          }
          emptyFallback={
            <UnknownState
              svgNode={<EmptySearch />}
              title="No listings found"
              subtitle="Try adjusting your search to find what you are looking for"
            />
          }
        >
          {pagination.hasNext && (
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
          )}
        </Property.Grid>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default PropertyTypePage;
