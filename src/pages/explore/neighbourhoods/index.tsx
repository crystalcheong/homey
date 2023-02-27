import { Box, Image, Overlay, SimpleGrid, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";

import { useNinetyNineStore } from "@/data/stores";

import { Layout } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const NeighbourhoodsPage = () => {
  const router = useRouter();

  const neighbourhoods = useNinetyNineStore.use.neighbourhoods();
  api.ninetyNine.getNeighbourhoods.useQuery(undefined, {
    onSuccess(data) {
      logger("index.tsx line 19", { data });
      useNinetyNineStore.setState(() => ({
        neighbourhoods: data,
      }));
    },
  });

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
        {Object.values(neighbourhoods).map(({ name, assetUrl }) => (
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
