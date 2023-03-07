import { Box, Button, SimpleGrid, Title, useMantineTheme } from "@mantine/core";
import { useState } from "react";

import { ProjectLaunch } from "@/data/clients/ninetyNine";
import { defaultLaunchPaginationInfo } from "@/data/stores";

import { Layout } from "@/components";
import BetaWarning from "@/components/Layouts/BetaWarning";
import LaunchCard from "@/components/Properties/LaunchCard";

import { api } from "@/utils/api";

const NewLaunchesPage = () => {
  const theme = useMantineTheme();

  const [pagination, setPagination] = useState<
    typeof defaultLaunchPaginationInfo
  >(defaultLaunchPaginationInfo);
  const [launches, setLaunches] = useState<ProjectLaunch[]>([]);

  const placeholderCount = 3;

  const { refetch, isFetching: isLoading } =
    api.ninetyNine.getLaunches.useQuery(
      {
        itemLimit: pagination.itemLimit,
        itemOffset: pagination.itemOffset,
        sortType: pagination.sortType,
      },
      {
        enabled: !launches.length,
        onSuccess(data) {
          if (data) {
            setLaunches(data);
            setPagination({
              ...pagination,
              itemOffset: pagination.itemOffset + pagination.itemLimit,
            });
          }
        },
      }
    );

  const handleLoadMoreListings = () => {
    if (isLoading) return;
    refetch();
  };

  return (
    <Layout.Base>
      <BetaWarning />
      <Title
        order={1}
        size="h3"
        py="md"
        tt="capitalize"
      >
        New Condo Launches
      </Title>
      <SimpleGrid
        cols={3}
        spacing="lg"
        breakpoints={[
          { maxWidth: "md", cols: 2, spacing: "md" },
          { maxWidth: "sm", cols: 1, spacing: "sm" },
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
      >
        {(isLoading ? new Array(placeholderCount).fill(false) : launches).map(
          (launch, idx) => (
            <LaunchCard
              key={`${launch.development_id}-${idx}`}
              launch={launch}
              isLoading={isLoading}
            />
          )
        )}
      </SimpleGrid>

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
    </Layout.Base>
  );
};

export default NewLaunchesPage;
