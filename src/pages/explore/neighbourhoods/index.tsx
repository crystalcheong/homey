import { Box, Image, Overlay, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";

import { Layout } from "@/components";

import { api } from "@/utils/api";

const NeighbourhoodsPage = () => {
  const router = useRouter();

  const { data: neighbourhoodsData = {} } =
    api.ninetyNine.getNeighbourhoods.useQuery();

  return (
    <Layout.Base>
      <SimpleGrid
        cols={3}
        spacing="xl"
        breakpoints={[
          { maxWidth: "md", cols: 2, spacing: "lg" },
          { maxWidth: "xs", cols: 1, spacing: "sm" },
        ]}
      >
        {Object.entries(neighbourhoodsData).map(([name, assetUrl]) => (
          <Box
            key={`neighbourhood-${name}`}
            component={Link}
            href={`${router.pathname}/${name}`}
            sx={{
              position: "relative",
            }}
          >
            <Image
              src={assetUrl ?? null}
              fit="cover"
              height={150}
              alt={name}
              radius="md"
            />

            <Overlay
              opacity={0.6}
              color="#000"
              zIndex={1}
              radius="md"
            />
            <Text
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
              tt="uppercase"
              color="white"
            >
              {name.replace(/-/g, " ")}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Layout.Base>
  );
};

export default NeighbourhoodsPage;
