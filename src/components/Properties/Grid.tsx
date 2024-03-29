import {
  Box,
  BoxProps,
  Group,
  SimpleGrid,
  SimpleGridProps,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import dynamic from "next/dynamic";
import Link, { LinkProps } from "next/link";
import { ReactNode, useState } from "react";
import { TbLayoutGrid, TbLayoutList } from "react-icons/tb";

const Card = dynamic(() => import("@/components/Properties/Card"));

import { getLimitedArray, logger, useIsMobile } from "@/utils";

import {
  Listing,
  ListingType,
  ViewMode,
  ViewModes,
  ViewOrientation,
} from "@/types/ninetyNine";

interface Props extends BoxProps {
  listings: Listing[];
  placeholderCount?: number;
  maxViewableCount?: number;
  title?: string;
  subtitle?: ReactNode;

  isLoading?: boolean;
  showTitle?: boolean;
  showMoreCTA?: boolean;
  allowSaveListing?: boolean;

  gridProps?: SimpleGridProps;
  emptyFallback?: ReactNode;
  seeMoreLink?: LinkProps["href"];

  viewMode?: ViewMode;
  showViewMode?: boolean;
  hidden?: boolean;
}

export const Grid = ({
  listings = [],
  title = "",
  subtitle,
  seeMoreLink,
  isLoading = false,
  showTitle = true,
  showMoreCTA = false,
  hidden = false,
  allowSaveListing = false,
  placeholderCount = 3,
  maxViewableCount = 0,
  viewMode = ViewModes[0],
  showViewMode = false,
  gridProps,
  children,
  emptyFallback,
  ...rest
}: Props) => {
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);

  const hasNoListings = !listings.length;
  const hasMaxViewable: boolean =
    maxViewableCount > 0 && maxViewableCount <= listings.length;

  const listingType: ListingType = listings?.[0]?.listing_type || "";
  maxViewableCount = hasMaxViewable ? maxViewableCount : listings.length;
  const viewableListings: Listing[] = getLimitedArray(
    listings ?? [],
    maxViewableCount
  );

  const showEmptyFallback: boolean = !!emptyFallback && hasNoListings;

  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);

  const getViewModeIcon = (viewMode: ViewMode): ReactNode => {
    switch (viewMode) {
      case ViewModes[0]: {
        return <TbLayoutGrid />;
      }
      case ViewModes[1]: {
        return <TbLayoutList />;
      }
    }
  };

  const handleModeChange = (viewMode: ViewMode) => {
    const isActiveMode: boolean = currentViewMode === viewMode;
    logger("Grid.tsx line 104", {
      card: ViewOrientation[viewMode],
      ViewOrientation,
    });
    if (isActiveMode) return;
    setCurrentViewMode(viewMode);
  };

  return (
    <Box
      component="section"
      hidden={hidden}
      {...rest}
    >
      <Group
        position="apart"
        hidden={!(showTitle || showMoreCTA)}
      >
        {showTitle && (
          <>
            <Title
              order={2}
              size="h3"
              py="md"
              tt="capitalize"
              data-pw={`grid-text-title-${title || listingType}`}
            >
              {`${title || listingType} Listings`.trim()}
            </Title>

            <Group
              spacing="xs"
              hidden={isMobile || !showViewMode}
            >
              {ViewModes.map((mode) => {
                const isActiveMode: boolean = currentViewMode === mode;
                return (
                  <ThemeIcon
                    key={`viewMode-${mode}`}
                    variant={isActiveMode ? "gradient" : "default"}
                    onClick={() => handleModeChange(mode)}
                  >
                    {getViewModeIcon(mode)}
                  </ThemeIcon>
                );
              })}
            </Group>
          </>
        )}

        <Text
          hidden={!showMoreCTA}
          component={Link}
          href={seeMoreLink ?? `/property/${listingType}`}
          size="sm"
          fw={500}
          variant="gradient"
        >
          See More
        </Text>
      </Group>

      {subtitle}

      {showEmptyFallback && !isLoading ? (
        emptyFallback
      ) : (
        <>
          <SimpleGrid
            cols={currentViewMode === ViewModes[0] ? 3 : 1}
            spacing="lg"
            {...(currentViewMode === ViewModes[0] && {
              breakpoints: [
                { maxWidth: "md", cols: 2, spacing: "md" },
                { maxWidth: "xs", cols: 1, spacing: "sm" },
              ],
            })}
            sx={{
              placeItems: "center",
              gridAutoRows: "1fr",
              position: "relative",
            }}
            {...gridProps}
          >
            {(isLoading || hasNoListings
              ? new Array(placeholderCount).fill(false)
              : viewableListings
            ).map((listing, idx) => (
              <Card
                key={`listing-${listing.id}-${idx}`}
                listing={listing}
                isLoading={isLoading}
                allowSaveListing={allowSaveListing}
                data-pw={`listing-card-${idx}`}
                orientation={ViewOrientation[currentViewMode]}
              />
            ))}
          </SimpleGrid>

          {children}
        </>
      )}
    </Box>
  );
};

export default Grid;
