import { MantineSize, MantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const useIsMobile = (
  theme: MantineTheme,
  breakpoint: MantineSize = "xs"
) =>
  useMediaQuery(`(max-width: ${theme.breakpoints[breakpoint]}px)`, true, {
    getInitialValueInEffect: false,
  });

export const useIsTablet = (
  theme: MantineTheme,
  breakpoint: MantineSize = "md"
) =>
  useMediaQuery(`(max-width: ${theme.breakpoints[breakpoint]}px)`, true, {
    getInitialValueInEffect: false,
  });
