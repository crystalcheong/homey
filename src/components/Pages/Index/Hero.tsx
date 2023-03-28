import {
  Box,
  BoxProps,
  Button,
  Collapse,
  Divider,
  Group,
  Menu,
  MultiSelect,
  RangeSlider,
  Tabs,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useState } from "react";
import { IconType } from "react-icons";
import { HiHomeModern } from "react-icons/hi2";
import { MdApartment, MdOutlineRealEstateAgent } from "react-icons/md";
import { TbChevronDown, TbSearch } from "react-icons/tb";

import {
  ListingCategories,
  ListingCategory,
  ListingType,
  ListingTypes,
} from "@/data/clients/ninetyNine";
import { neighbourhoodNames } from "@/data/stores";

import { logger, toTitleCase, useIsMobile } from "@/utils";

const SearchTypes: string[] = ["rent", "buy"];
export type SearchType = (typeof SearchTypes)[number];
export const SearchListingTypes: {
  [key in SearchType]: ListingType;
} = SearchTypes.reduce(
  (searchMap = {}, type: string, idx: number) => ({
    ...searchMap,
    [type]: ListingTypes[idx],
  }),
  {}
);

export const LocationSelection = neighbourhoodNames.map((name) => ({
  label: toTitleCase(name.replace(/-/g, " ")),
  value: name,
}));

export const ListingCategoryIcons: {
  [key in ListingCategory]: IconType;
} = {
  [ListingCategories[0]]: MdOutlineRealEstateAgent,
  [ListingCategories[1]]: MdApartment,
  [ListingCategories[2]]: HiHomeModern,
};

export const FilterFormState: {
  location: string[];
  category: ListingCategory;
} = {
  location: [],
  category: "",
};

interface Props extends BoxProps {
  headline: string;
  subHeading: string;
}

const Hero = ({ children, headline, subHeading, ...rest }: Props) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);

  const isDark: boolean = theme.colorScheme === "dark";

  // const today: Date = new Date();

  //#endregion  //*======== Search Type ===========

  const [showPriceRange, { toggle: togglePriceRange, close: closePriceRange }] =
    useDisclosure(false);

  const [searchType, setSearchType] = useState<SearchType>(SearchTypes[0]);
  const handleSearchTypeChange = (searchType: string) => {
    closePriceRange();
    setSearchType(searchType);
  };

  const isRent: boolean = searchType === "rent";
  const searchTypeRange: [number, number] = [
    isRent ? 1000 : 100000,
    isRent ? 50000 : 20000000,
  ];

  const searchTypeRangeMarks = [
    { value: 0.2 * searchTypeRange[1], label: `$${0.2 * searchTypeRange[1]}` },
    { value: 0.5 * searchTypeRange[1], label: `$${0.5 * searchTypeRange[1]}` },
    { value: 0.8 * searchTypeRange[1], label: `$${0.8 * searchTypeRange[1]}` },
  ];

  //#endregion  //*======== Search Type ===========

  //#endregion  //*======== Query Form Group ===========

  const [formState, setFormState] =
    useState<typeof FilterFormState>(FilterFormState);

  const [rangeValue, setRangeValue] = useState<[number, number]>([
    searchTypeRange[0],
    searchTypeRange[1] * 0.5,
  ]);

  // const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const inputValue = (event.currentTarget.value ?? "").trim();
  //   setFormState({
  //     ...formState,
  //     [event.currentTarget.id]: inputValue,
  //   });
  // };

  const handleLocationChange = (selectedLocations: string[]) => {
    setFormState({
      ...formState,
      location: selectedLocations,
    });
  };

  const handleOnBrowseClick = () => {
    const searchRoute = SearchListingTypes[searchType];
    const formParams = Object.fromEntries(
      Object.entries(formState)
        .filter(([, v]) => !!v)
        .map(([k, v]) => [k, JSON.stringify(v)])
    );
    if (!formState.location.length) {
      delete formParams.location;
    }

    logger("index.tsx line 67", {
      searchRoute,
      formState,
      formParams,
    });

    let searchQuery = `${router.basePath}/property/${searchRoute}`;
    if (Object.keys(formParams).length) {
      const params = new URLSearchParams(formParams);
      searchQuery += `?${params}`;
      logger("Hero.tsx line 100", searchQuery, formParams);
    }

    router.push(searchQuery, undefined, {
      scroll: true,
    });
  };

  //#endregion  //*======== Query Form Group ===========

  return (
    <Box
      component="section"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.lg,
      }}
      {...rest}
    >
      <Title
        order={1}
        data-pw="hero-text-headline"
      >
        {headline}
      </Title>
      <Title
        order={2}
        size="p"
        color="dimmed"
        sx={{
          ...(!isMobile && {
            maxWidth: `calc(${theme.breakpoints.xs}px - 100px)`,
          }),
        }}
        data-pw="hero-text-subHeading"
      >
        {subHeading}
      </Title>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          placeContent: "start",
          gap: theme.spacing.md,
        }}
      >
        <Group>
          <Divider
            orientation="vertical"
            color={theme.primaryColor}
          />
          <Box>
            <Title
              order={3}
              size="h3"
              variant="gradient"
            >
              50k+
            </Title>
            <Text
              c="dimmed"
              fw={500}
            >
              renters
            </Text>
          </Box>
          <Divider
            orientation="vertical"
            color={theme.primaryColor}
          />
          <Box>
            <Title
              order={3}
              size="h3"
              variant="gradient"
            >
              10k+
            </Title>
            <Text
              c="dimmed"
              fw={500}
            >
              properties
            </Text>
          </Box>
        </Group>

        <Tabs
          value={searchType}
          onTabChange={handleSearchTypeChange}
          styles={(theme) => ({
            root: {
              boxShadow: theme.shadows.md,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.sm,
              ...(!isMobile && {
                padding: theme.spacing.md,
                maxWidth: theme.breakpoints.sm,
              }),
            },
            tabsList: {
              marginBottom: theme.spacing.md,
            },
            tabLabel: {
              textTransform: "capitalize",
            },
          })}
        >
          <Tabs.List grow={isMobile}>
            {SearchTypes.map((type) => (
              <Tabs.Tab
                key={`tab-${type}`}
                value={type}
              >
                {type}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {SearchTypes.map((type) => (
            <Tabs.Panel
              key={`tabPanel-${type}`}
              value={type}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  placeContent: "start",
                  placeItems: "start",
                  gap: theme.spacing.xs,
                  "&>*": {
                    width: isMobile ? "100%" : "auto",
                  },
                  ...(!isMobile && {
                    flexDirection: "row",
                    placeItems: "start",
                  }),
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    placeContent: "start",
                    placeItems: "start",
                    gap: theme.spacing.xs,

                    "&>*": {
                      width: "100%",
                    },
                  }}
                >
                  <MultiSelect
                    data={LocationSelection}
                    searchable
                    clearable
                    placeholder="Search Location"
                    nothingFound="No matching locations"
                    id="locations"
                    value={formState.location}
                    onChange={handleLocationChange}
                    maxDropdownHeight={160}
                    clearButtonLabel="Clear search locations"
                    maxSelectedValues={3}
                    transitionDuration={150}
                    transition="pop-top-left"
                    transitionTimingFunction="ease"
                    styles={(theme) => ({
                      root: {
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

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      placeContent: "start",
                      placeItems: "center",
                      gap: theme.spacing.md,
                    }}
                  >
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

                    <Button
                      hidden
                      variant="subtle"
                      p={0}
                      px={2}
                      w={130}
                      ta="start"
                      rightIcon={<TbChevronDown size={16} />}
                      onClick={togglePriceRange}
                    >
                      Price Range
                    </Button>
                  </Box>

                  <Collapse
                    in={showPriceRange}
                    transitionDuration={100}
                    transitionTimingFunction="linear"
                  >
                    <RangeSlider
                      labelAlwaysOn
                      marks={searchTypeRangeMarks}
                      min={searchTypeRange[0]}
                      max={searchTypeRange[1]}
                      step={searchTypeRange[0]}
                      value={rangeValue}
                      onChange={setRangeValue}
                    />
                  </Collapse>
                </Box>

                <Button
                  // mt={isMobile ? 0 : "xl"}
                  rightIcon={<TbSearch size={14} />}
                  loaderPosition="right"
                  onClick={handleOnBrowseClick}
                  variant="gradient"
                  data-pw={`hero-btn-browse-${type}`}
                >
                  Browse properties
                </Button>
              </Box>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Box>

      {children}
    </Box>
  );
};

export default Hero;
