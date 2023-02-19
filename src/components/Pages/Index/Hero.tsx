import {
  Box,
  BoxProps,
  Button,
  Divider,
  Group,
  Tabs,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useRouter } from "next/router";
import React, { ChangeEvent, useState } from "react";
import { TbCalendar, TbSearch } from "react-icons/tb";

import { ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import { logger } from "@/utils/debug";
import { useIsMobile } from "@/utils/dom";

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

const InitalFormState = {
  location: "",
  moveInDate: new Date(),
};

type Props = BoxProps;

const Hero = ({ children, ...rest }: Props) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);

  //#endregion  //*======== Search Type ===========

  const [searchType, setSearchType] = useState<SearchType>(SearchTypes[0]);
  const handleSearchTypeChange = (searchType: string) => {
    setSearchType(searchType);
  };

  //#endregion  //*======== Search Type ===========

  //#endregion  //*======== Query Form Group ===========

  const [formState, setFormState] =
    useState<typeof InitalFormState>(InitalFormState);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.currentTarget.value ?? "";
    setFormState({
      ...formState,
      [event.currentTarget.id]: inputValue,
    });
  };

  const handleDateChange = (inputDate: Date) => {
    setFormState({
      ...formState,
      moveInDate: inputDate,
    });
  };

  const handleOnBrowseClick = () => {
    const searchRoute = SearchListingTypes[searchType];
    logger("index.tsx line 67", {
      searchRoute,
    });
    router.push(`./property/${searchRoute}`);
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
      <Title order={1}>Buy, rent, or sell your property easily</Title>
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
        A great platform to buy, sell, or even rent your properties without any
        commisions.
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
              color={theme.primaryColor}
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
              color={theme.primaryColor}
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
              ...(!isMobile && {
                padding: theme.spacing.md,
                maxWidth: theme.breakpoints.xs,
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
                  gap: theme.spacing.md,
                  "&>*": {
                    width: isMobile ? "100%" : "auto",
                  },

                  ...(!isMobile && {
                    flexDirection: "row",
                    placeItems: "end",
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
                    gap: theme.spacing.sm,
                    "&>*": {
                      width: isMobile ? "100%" : "auto",
                    },
                    ...(!isMobile && {
                      flexDirection: "row",
                      placeItems: "center",
                    }),
                  }}
                >
                  <TextInput
                    placeholder="Search Location"
                    label="When"
                    id="location"
                    value={formState.location}
                    onChange={handleInputChange}
                  />
                  <DatePicker
                    placeholder="Select Move-in Date"
                    label="When"
                    icon={<TbCalendar size={16} />}
                    id="moveInDate"
                    value={formState.moveInDate}
                    onChange={handleDateChange}
                  />
                </Box>
                <Button
                  rightIcon={<TbSearch size={14} />}
                  loaderPosition="right"
                  onClick={handleOnBrowseClick}
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
