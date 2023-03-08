import {
  Box,
  BoxProps,
  Group,
  SimpleGrid,
  SimpleGridProps,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { ReactNode } from "react";

import { Listing, ListingType } from "@/data/clients/ninetyNine";

import { Card } from "@/components/Properties";

import { getLimitedArray } from "@/utils/helpers";

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
}

export const Grid = ({
  listings = [],
  title = "",
  subtitle,
  isLoading = false,
  showTitle = true,
  showMoreCTA = false,
  allowSaveListing = false,
  placeholderCount = 3,
  maxViewableCount = 0,
  gridProps,
  children,
  emptyFallback,
  ...rest
}: Props) => {
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

  return (
    <Box
      component="section"
      {...rest}
    >
      {(showTitle || showMoreCTA) && (
        <Group position="apart">
          {showTitle && (
            <Title
              order={1}
              size="h3"
              py="md"
              tt="capitalize"
            >
              {`${title || listingType} Listings`.trim()}
            </Title>
          )}

          {showMoreCTA && (
            <Text
              component={Link}
              href={`/property/${listingType}`}
              size="sm"
              fw={500}
              variant="gradient"
            >
              See More
            </Text>
          )}
        </Group>
      )}
      {subtitle}

      {showEmptyFallback && !isLoading ? (
        emptyFallback
      ) : (
        <>
          <SimpleGrid
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: "md", cols: 2, spacing: "md" },
              { maxWidth: "xs", cols: 1, spacing: "sm" },
            ]}
            sx={{
              placeItems: "center",
              gridAutoRows: "1fr",
              position: "relative",
              "&>*": {
                height: "100%",
                width: "100%",
              },
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
