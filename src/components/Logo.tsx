import { Badge, Box, Text, useMantineTheme } from "@mantine/core";
import Link from "next/link";

import HomeyLogo from "~/assets/brand/homey.svg";

interface Props {
  hideBrand?: boolean;
}

const Logo = ({ hideBrand = false }: Props) => {
  const theme = useMantineTheme();

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
          gradient={{ from: "violet", to: "violet.4", deg: 45 }}
          component="p"
          ta="center"
          fw={700}
          fz="xl"
          m={0}
        >
          Homey
        </Text>
      )}
      <Badge>Beta</Badge>
    </Box>
  );
};

export default Logo;
