import { Box, Text, useMantineTheme } from "@mantine/core";
import Link from "next/link";

import HomeyLogo from "~/assets/brand/homey.svg";

const Logo = () => {
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
      <Text
        variant="gradient"
        gradient={{ from: "violet", to: "violet.4", deg: 45 }}
        ta="center"
        fw={700}
        fz="xl"
        component="p"
      >
        Homey
      </Text>
    </Box>
  );
};

export default Logo;
