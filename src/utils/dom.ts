import { MantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const useIsMobile = (theme: MantineTheme) =>
  useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`, true, {
    getInitialValueInEffect: false,
  });
