import {
  Accordion,
  Badge,
  Box,
  Group,
  Image,
  Overlay,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
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

import { AreaCategory, AreaCategoryData } from "@/data/clients/ninetyNine";
import { getPredefinedNeighbourhoods, useNinetyNineStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

import EmptySearch from "~/assets/images/empty-search.svg";

export const getCategoryIcon: Record<string, IconType> = {
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

export const getCategoryContent = (
  categoryKey: AreaCategory["key"],
  categoryData: AreaCategoryData
) => {
  switch (categoryKey) {
    case "subway_station":
      return (categoryData.station_options ?? []).map((service, idx) => (
        <Badge
          key={`${categoryData.id}-${idx}-${service?.label}`}
          styles={{
            root: {
              background: service?.background_color,
              color: service?.text_color,
              marginLeft: "10px",
            },
          }}
        >
          {categoryData.name ?? ""}
        </Badge>
      ));
    case "bus_station": {
      return (
        <Box
          key={categoryData.id}
          pb="md"
        >
          <Text>{categoryData.name}</Text>
          <Group mt="sm">
            {(categoryData.station_options ?? []).map((service, idx) => (
              <Badge
                key={`${categoryData.id}-${idx}-${service?.label}`}
                styles={{
                  root: {
                    background: service?.background_color,
                    color: service?.text_color,
                  },
                }}
              >
                {service?.label ?? ""}
              </Badge>
            ))}
          </Group>
        </Box>
      );
    }
    //   return null
    case "shopping_mall":
    case "park": {
      return (
        <Box key={categoryData.id}>
          <Text>{categoryData.name}</Text>
        </Box>
      );
    }
    default:
      return (
        <Box key={categoryData.id}>
          <Text>{categoryData.name}</Text>
        </Box>
      );
  }
};

export const getCategoryPanel = (categoryData: AreaCategory) => (
  <Accordion.Panel key={categoryData.key}>
    {(categoryData.data ?? []).map((data) =>
      getCategoryContent(categoryData.key, data)
    )}
  </Accordion.Panel>
);

const Neighbourhood = () => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { name } = router.query;

  const neighbourhoods = useNinetyNineStore.use.neighbourhoods();

  const paramName: string = (name ?? "").toString();
  const isValidName: boolean =
    (Object.keys(neighbourhoods).includes(paramName) || !!paramName.length) ??
    false;

  const neighbourhoodInfo = isValidName
    ? getPredefinedNeighbourhoods()[paramName]
    : null;

  const [{ isFetching: isFetchingNeighbourhood, data: neighbourhoodData }] =
    api.useQueries((t) => [
      t.ninetyNine.getNeighbourhood(
        {
          name: paramName,
        },
        {
          enabled: isValidName,
        }
      ),
    ]);

  const isLoading: boolean = isFetchingNeighbourhood;

  logger("[name].tsx line 26", { neighbourhoodData });

  return (
    <Layout.Base isLoading={isLoading}>
      <Provider.RenderGuard
        renderIf={!!neighbourhoodData}
        fallbackComponent={
          !isLoading ? (
            <UnknownState
              svgNode={<EmptySearch />}
              title="Neighbourhood not found"
              subtitle="Woops, the neighbourhood has vanished"
            />
          ) : null
        }
      >
        <Box
          component="section"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.md,
          }}
        >
          <Box
            sx={{
              position: "relative",
            }}
          >
            <Image
              withPlaceholder
              src={neighbourhoodInfo?.assetUrl}
              fit="cover"
              height={250}
              alt={neighbourhoodInfo?.name}
              radius="md"
            />

            <Overlay
              opacity={0.6}
              color="#000"
              zIndex={1}
              radius="md"
            />
            <Title
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 2,

                display: "inline-flex",
                placeContent: "center",
                placeItems: "center",
              }}
              align="center"
              fw={800}
              color="white"
              order={2}
              size="h2"
              tt="uppercase"
            >
              {paramName.replace(/-/g, " ")}
            </Title>
          </Box>

          <Box>
            <Accordion
              variant="separated"
              defaultValue="subway_station"
            >
              {(neighbourhoodData?.categories ?? []).map((category) => {
                const categoryData = category.data ?? [];
                if (!categoryData.length) return null;
                const categoryPanel = getCategoryPanel(category);
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
                    {categoryPanel}
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
