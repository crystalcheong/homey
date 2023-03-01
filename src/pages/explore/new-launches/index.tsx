import { SimpleGrid } from "@mantine/core";
import { useState } from "react";

import { ProjectLaunch } from "@/data/clients/ninetyNine";
import { defaultLaunchPaginationInfo } from "@/data/stores";

import { Layout } from "@/components";
import BetaWarning from "@/components/Layouts/BetaWarning";
import LaunchCard from "@/components/Properties/LaunchCard";

import { api } from "@/utils/api";

const NewLaunchesPage = () => {
  const [pagination, setPagination] = useState<
    typeof defaultLaunchPaginationInfo
  >(defaultLaunchPaginationInfo);
  const [launches, setLaunches] = useState<ProjectLaunch[]>([]);

  // const {
  //   // refetch,
  //   // isFetching: isLoading
  // } =
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
  return (
    <Layout.Base>
      <BetaWarning />
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
      >
        {launches.map((launch) => (
          <LaunchCard
            key={launch.development_id}
            launch={launch}
          />
        ))}
      </SimpleGrid>
    </Layout.Base>
  );
};

export default NewLaunchesPage;
