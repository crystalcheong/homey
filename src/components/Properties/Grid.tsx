import {
  Box,
  BoxProps,
  SimpleGrid,
  SimpleGridProps,
  Title,
} from "@mantine/core";

import { Listing, ListingType } from "@/data/clients/ninetyNine";

import { Card } from "@/components/Properties";

import { getLimitedArray } from "@/utils/helpers";

interface Props extends BoxProps {
  listings: Listing[];
  placeholderCount?: number;
  maxViewableCount?: number;
  isLoading?: boolean;
  showTitle?: boolean;

  gridProps?: SimpleGridProps;
}

export const Grid = ({
  listings = [],
  isLoading = false,
  showTitle = true,
  placeholderCount = 3,
  maxViewableCount = 0,
  gridProps,
  children,
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

  return (
    <Box {...rest}>
      {showTitle && (
        <Title
          order={1}
          size="h3"
          py="md"
          tt="capitalize"
        >
          {`${listingType} Listings`.trim()}
        </Title>
      )}

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
          />
        ))}
      </SimpleGrid>

      {children}
    </Box>
  );
};

export default Grid;
