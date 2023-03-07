import {
  Box,
  BoxProps,
  Button,
  Divider,
  Group,
  Menu,
  MultiSelect,
  Tabs,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
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

import { logger } from "@/utils/debug";
import { useIsMobile } from "@/utils/dom";
import { toTitleCase } from "@/utils/helpers";

const SearchTypes: string[] = ["rent", "buy"];
export type SearchType = (typeof SearchTypes)[number];
const SearchListingTypes: {
  [key in SearchType]: ListingType;
} = SearchTypes.reduce(
  (searchMap = {}, type: string, idx: number) => ({
    ...searchMap,
    [type]: ListingTypes[idx],
  }),
  {}
);

const LocationSelection = neighbourhoodNames.map((name) => ({
  label: toTitleCase(name.replace(/-/g, " ")),
  value: name,
}));

const ListingCategoryIcons: {
  [key in ListingCategory]: IconType;
} = {
  [ListingCategories[0]]: MdOutlineRealEstateAgent,
  [ListingCategories[1]]: MdApartment,
  [ListingCategories[2]]: HiHomeModern,
};

const InitalFormState: {
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

  const [searchType, setSearchType] = useState<SearchType>(SearchTypes[0]);
  const handleSearchTypeChange = (searchType: string) => {
    setSearchType(searchType);
  };

  //#endregion  //*======== Search Type ===========

  //#endregion  //*======== Query Form Group ===========

  const [formState, setFormState] =
    useState<typeof InitalFormState>(InitalFormState);

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
      <Title order={1}>{headline}</Title>
      <Title
        order={2}
        size="p"
        color="dimmed"
        sx={{
          ...(!isMobile && {
            maxWidth: `calc(${theme.breakpoints.xs}px - 100px)`,
          }),
        }}
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
              gradient={{ from: "violet.4", to: "violet.8" }}
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
              gradient={{ from: "violet.4", to: "violet.8" }}
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
          styles={{
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
          }}
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
                    <Menu
                      shadow="md"
                      width={110}
                    >
                      <Menu.Target>
                        <Button
                          variant="subtle"
                          p={0}
                          px={2}
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
                                  ? InitalFormState.category
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
                  </Box>
                </Box>

                <Button
                  // mt={isMobile ? 0 : "xl"}
                  rightIcon={<TbSearch size={14} />}
                  loaderPosition="right"
                  onClick={handleOnBrowseClick}
                  variant="gradient"
                  gradient={{ from: "violet.4", to: "violet.8" }}
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
