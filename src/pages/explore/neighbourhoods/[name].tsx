import { Badge, Box, Group, Title } from "@mantine/core";
import { useRouter } from "next/router";

import { useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const Neighbourhood = () => {
  const router = useRouter();
  const { name } = router.query;

  const neighbourhoods = useNinetyNineStore.use.neighbourhoods();

  const paramName: string = (name ?? "").toString();
  const isValidName: boolean =
    (Object.keys(neighbourhoods).includes(paramName) || !!paramName.length) ??
    false;

  const { data: neighbourhoodData } = api.ninetyNine.getNeighbourhood.useQuery(
    {
      name: paramName,
    },
    {
      enabled: isValidName,
    }
  );

  logger("[name].tsx line 26", { neighbourhoodData });

  return (
    <Layout.Base>
      <Provider.RenderGuard renderIf={!!neighbourhoodData}>
        <Box component="section">
          <Title
            order={1}
            size="h2"
            tt="capitalize"
          >
            {paramName.replace(/-/g, " ")}
          </Title>

          <Group>
            {neighbourhoodData?.categories?.[0].name}:
            <Group>
              {(neighbourhoodData?.categories?.[0]?.data ?? []).map(
                ({ id, name, station_options }) => (
                  <Badge
                    key={id}
                    styles={{
                      root: {
                        background: station_options?.[0]?.background_color,
                        color: station_options?.[0]?.text_color,
                      },
                    }}
                  >
                    {name}
                  </Badge>
                )
              )}
            </Group>
          </Group>
        </Box>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default Neighbourhood;
