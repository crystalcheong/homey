import {
  Box,
  Button,
  Group,
  Menu,
  MultiSelect,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { TbChevronDown, TbLocation } from "react-icons/tb";

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
import {
  FilterFormState,
  ListingCategoryIcons,
  LocationSelection,
} from "@/components/Pages/Index/Hero";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";
import { getObjectValueCount } from "@/utils/helpers";

import EmptySearch from "~/assets/images/empty-search.svg";
import ErrorClient from "~/assets/images/error-client.svg";

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
  const isDark: boolean = theme.colorScheme === "dark";

  const [formState, setFormState] =
    useState<typeof FilterFormState>(FilterFormState);

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
  const paramLocations: string[] = useMemo(
    () => getLocations(paramLocation),
    [paramLocation]
  );
  const zoneIds: string = useMemo(
    () => getZoneIds(formState.location),
    [formState.location]
  );
  const isZonal = !!zoneIds.length;

  const listingsKey = isZonal ? "queryListings" : "listings";
  const listingType: ListingType = paramType;
  const listingCategory: ListingCategory = paramCategory;

  useMemo(() => {
    setFormState({
      location: paramLocations,
      category: listingCategory,
    });
  }, [listingCategory, paramLocations]);

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
      if (formState.category.length)
        filteredListings = filteredListings.filter(
          ({ main_category }) =>
            main_category.toLowerCase() === formState.category.toLowerCase()
        );
      if (zoneIds.length)
        filteredListings = filteredListings.filter(({ cluster_mappings }) =>
          zoneIds.includes(cluster_mappings?.zone?.[0] ?? "")
        );

      return filteredListings;
    },
    [zoneIds, formState.category]
  );

  const viewableListings = useMemo(
    () => getFilteredListings(listings),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listings, zoneIds, formState.category]
  );

  const updateListings = useNinetyNineStore.use.updateListings();

  const { isFetching: isLoading, refetch } =
    api.ninetyNine.getZoneListings.useQuery(
      {
        listingType,
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        zoneId: zoneIds,
        listingCategory: formState.category,
      },
      {
        enabled:
          (isValidType || isValidCategory) &&
          viewableListings.length < pagination.pageSize &&
          pagination.hasNext,
        onSuccess(data) {
          logger("index.tsx line 89/getZoneListings/onSuccess", {
            data,
            locations: formState.location,
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
      <Provider.RenderGuard
        renderIf={isValidType}
        fallbackComponent={
          <UnknownState
            svgNode={<ErrorClient />}
            title="Listing type not found"
            subtitle="Hey, you aren't supposed to be here"
          />
        }
      >
        <Property.Grid
          listings={viewableListings}
          isLoading={isLoading}
          allowSaveListing={isAuth}
          title={listingType}
          subtitle={
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
                Filters (
                <Text
                  component="span"
                  size="sm"
                  color={theme.fn.primaryColor()}
                  fw={800}
                >
                  {getObjectValueCount(formState)}
                </Text>
                ):
              </Text>

              <MultiSelect
                data={LocationSelection}
                searchable
                clearable
                placeholder="Search Location"
                nothingFound="No matching locations"
                id="locations"
                value={formState.location}
                icon={<TbLocation color={theme.fn.primaryColor()} />}
                onChange={(selectedLocations: string[]) => {
                  setFormState({
                    ...formState,
                    location: selectedLocations,
                  });
                }}
                maxDropdownHeight={160}
                clearButtonLabel="Clear search locations"
                maxSelectedValues={3}
                transitionDuration={150}
                transition="pop-top-left"
                transitionTimingFunction="ease"
                styles={{
                  root: {
                    flex: 1,
                  },
                  defaultValue: {
                    background: theme.fn.gradient(),
                    fontWeight: 700,
                    color: isDark ? theme.white : theme.black,
                  },
                }}
              />
              <Menu shadow="md">
                <Menu.Target>
                  <Button
                    variant="subtle"
                    p={0}
                    px={2}
                    w={130}
                    ta="start"
                    rightIcon={<TbChevronDown size={16} />}
                  >
                    {formState.category.length
                      ? `Type: ${formState.category}`
                      : "Property Type"}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  {ListingCategories.map((category) => {
                    const CategoryIcon: IconType =
                      ListingCategoryIcons[category];
                    const isCategorySelected: boolean =
                      formState.category === category;
                    const isSelected = !!formState.category.length;

                    const CategoryColor = isCategorySelected
                      ? theme.fn.primaryColor()
                      : isDark
                      ? theme.white
                      : theme.black;

                    const handleOnClick = () => {
                      setFormState({
                        ...formState,
                        category:
                          isCategorySelected && isSelected
                            ? FilterFormState.category
                            : category,
                      });
                    };

                    return (
                      <Menu.Item
                        key={category}
                        icon={
                          <CategoryIcon
                            size={14}
                            color={CategoryColor}
                          />
                        }
                        onClick={handleOnClick}
                      >
                        {category}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            </Group>
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
