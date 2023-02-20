import { MantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export const useIsMobile = (theme: MantineTheme) =>
  useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`, true, {
    getInitialValueInEffect: false,
  });

export const useIsTablet = (theme: MantineTheme) =>
  useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`, true, {
    getInitialValueInEffect: false,
  });
