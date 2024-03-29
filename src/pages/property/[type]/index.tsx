import {
  Button,
  Group,
  Menu,
  MultiSelect,
  Pagination,
  Text,
  useMantineTheme,
} from "@mantine/core";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { TbChevronDown, TbLocation } from "react-icons/tb";

import {
  defaultListingMap,
  defaultPaginationInfo,
  useNinetyNineStore,
} from "@/data/stores";

import { Layout, Provider } from "@/components";
const PropertyGrid = dynamic(() => import("@/components/Properties/Grid"));
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));

import { api, getObjectValueCount, logger } from "@/utils";

import {
  FilterFormState,
  ListingCategoryIcons,
  LocationSelection,
} from "@/types/account";
import {
  getZoneIds,
  Listing,
  ListingCategories,
  ListingCategory,
  ListingType,
  ListingTypes,
  PaginationInfo,
} from "@/types/ninetyNine";

import EmptySearch from "~/assets/images/empty-search.svg";
import ErrorClient from "~/assets/images/error-client.svg";

const PropertyTypePage = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { type, location, category } = router.query;

  const { data: sessionData } = useSession();

  const isAuth = !!sessionData;
  const isDark: boolean = theme.colorScheme === "dark";

  const [formState, setFormState] =
    useState<typeof FilterFormState>(FilterFormState);
  const [pageNum, setPageNum] = useState<number>(1);

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
  const paramLocations: string[] = useMemo(() => {
    let locations: string[] = [];
    if (!paramLocation.length) return locations;

    try {
      locations = JSON.parse(paramLocation) ?? [];
    } catch (e) {
      return locations;
    }
    return locations;
  }, [paramLocation]);
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

  const { isFetching: isLoading } = api.ninetyNine.getZoneListings.useQuery(
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
        viewableListings.length < pagination.pageSize * pageNum &&
        pagination.hasNext,
      onSuccess: (data) => {
        logger("index.tsx line 89/getZoneListings/onSuccess", {
          data,
          locations: formState.location,
          paramLocations,
          defaultListingMap,
          zoneIds,
        });

        if (!data.length) return;

        updateListings(listingType, data as Listing[], isZonal);
      },
    }
  );

  const handleOnPageChange = (pageNum: number) => {
    setPageNum(pageNum);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <Layout.Base
      showAffix={!!listings.length}
      seo={{
        templateTitle: `Properties ${paramType ? `for ${paramType}` : ""}`,
      }}
    >
      <Provider.RenderGuard
        renderIf={isValidType}
        fallbackComponent={
          <UnknownState
            hidden={isLoading}
            svgNode={<ErrorClient />}
            title="Listing type not found"
            subtitle="Hey, you aren't supposed to be here"
          />
        }
      >
        <PropertyGrid
          listings={viewableListings.slice(
            pagination.pageSize * (pageNum - 1),
            pagination.pageSize * pageNum
          )}
          isLoading={isLoading}
          showViewMode
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
                styles={(theme) => ({
                  root: {
                    flex: "1!important",
                    width: "100%",
                  },
                  wrapper: {
                    flex: 1,
                    width: "100%",
                  },
                  defaultValue: {
                    background: theme.fn.gradient(),
                    fontWeight: 700,
                    color: theme.white,
                  },
                  defaultValueRemove: {
                    color: theme.white,
                  },
                })}
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
              hidden={isLoading}
              svgNode={<EmptySearch />}
              title="No listings found"
              subtitle="Try adjusting your search to find what you are looking for"
            />
          }
        >
          {pagination.hasNext && (
            <Pagination
              withEdges
              total={5 + 5 * (pageNum * +pagination.hasNext)}
              page={pageNum}
              onChange={handleOnPageChange}
              mt="xl"
              position="center"
              styles={(theme) => ({
                item: {
                  "&[data-active]": {
                    backgroundImage: theme.fn.gradient(),
                  },
                },
              })}
            />
          )}
        </PropertyGrid>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default PropertyTypePage;
