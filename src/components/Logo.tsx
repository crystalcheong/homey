import { Badge, Box, Text, useMantineTheme } from "@mantine/core";
import Link from "next/link";

import { Metadata } from "@/data/static";
import { useAppStore } from "@/data/stores";

import HomeyLogo from "~/assets/brand/homey.svg";

interface Props {
  hideBrand?: boolean;
}

const Logo = ({ hideBrand = false }: Props) => {
  const theme = useMantineTheme();

  const isBetaPreview: boolean = useAppStore().isBetaPreview;

  return (
    <Box
      component={Link}
      href="/"
      sx={{
        display: "flex",
        flexDirection: "row",
        placeContent: "start",
        placeItems: "center",
        gap: theme.spacing.xs,
        textDecoration: "none",
      }}
    >
      <HomeyLogo size={40} />
      {!hideBrand && (
        <Text
          variant="gradient"
          component="p"
          ta="center"
          fw={700}
          fz="xl"
          m={0}
        >
          {Metadata.name}
        </Text>
      )}

      <Badge hidden={!isBetaPreview}>Beta</Badge>
    </Box>
  );
};

export default Logo;
