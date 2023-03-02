import { Accordion, Badge, Box, Group, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";
import { IconType } from "react-icons";
import {
  TbBuildingBank,
  TbBuildingHospital,
  TbBuildingStore,
  TbBus,
  TbCash,
  TbMail,
  TbMailbox,
  TbSchool,
  TbShoppingCart,
  TbTrain,
  TbTrees,
} from "react-icons/tb";

import { AreaCategory } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const getCategoryIcon: Record<string, IconType> = {
  subway_station: TbTrain,
  bus_station: TbBus,
  school_v2: TbSchool,
  supermarket: TbShoppingCart,
  shopping_mall: TbBuildingStore,
  clinic: TbBuildingHospital,
  bank: TbBuildingBank,
  atm: TbCash,
  post_office: TbMail,
  post_box: TbMailbox,
  park: TbTrees,
};
const getCategoryInfo = (categoryData: AreaCategory) => {
  switch (categoryData.key) {
    case "subway_station":
      return (categoryData.data ?? []).map((data) => (
        <Badge
          key={data.id}
          styles={{
            root: {
              background: data.station_options?.[0]?.background_color,
              color: data.station_options?.[0]?.text_color,
            },
          }}
        >
          {data.name}
        </Badge>
      ));
    case "shopping_mall":
    case "park": {
      return (categoryData.data ?? []).map((data) => (
        <Box key={data.id}>{data.name}</Box>
      ));
    }
    default:
      return (categoryData.data ?? []).map((data) => (
        <Box key={data.id}>{data.name}</Box>
      ));
  }
};

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

          <Box>
            <Accordion
              variant="separated"
              defaultValue="subway_station"
            >
              {(neighbourhoodData?.categories ?? []).map((category) => {
                const categoryInfo = getCategoryInfo(category);
                const CategoryIcon = getCategoryIcon[category.key];

                return (
                  <Accordion.Item
                    key={category.key}
                    value={category.key}
                  >
                    <Accordion.Control icon={<CategoryIcon size={16} />}>
                      <Group position="apart">
                        <Text>{category.name}</Text>
                        <Text
                          size="sm"
                          color="dimmed"
                          weight={400}
                        >
                          {(category.data ?? []).length}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>{categoryInfo}</Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Box>
        </Box>
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default Neighbourhood;
