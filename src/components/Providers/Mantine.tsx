import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core";
import { useColorScheme, useHotkeys, useLocalStorage } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { NavigationProgress } from "@mantine/nprogress";
import { PropsWithChildren } from "react";

const theme = (colorScheme: ColorScheme): MantineThemeOverride => {
  const isDark: boolean = colorScheme === "dark";

  return {
    black: isDark ? "#1F1F1F" : "#212121",
    white: isDark ? "#F5F5F5" : "#F8F9FA",
    primaryShade: { light: 5, dark: 5 },
    primaryColor: "violet",
    defaultGradient: { from: "violet.4", to: "violet.8" },
    colorScheme,
  };
};

export const Mantine = ({ children }: PropsWithChildren) => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "homey-theme",
    defaultValue: preferredColorScheme ?? "dark",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withCSSVariables
        withNormalizeCSS
        withGlobalStyles
        theme={theme(colorScheme)}
      >
        <NavigationProgress autoReset={true} />
        <NotificationsProvider
          limit={3}
          autoClose={4000}
        />
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
