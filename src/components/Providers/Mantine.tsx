import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
  MantineThemeOverride,
} from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { NavigationProgress } from "@mantine/nprogress";
import { PropsWithChildren } from "react";

const theme = (colorScheme: ColorScheme): MantineThemeOverride => {
  const isDark: boolean = colorScheme === "dark";

  return {
    black: isDark ? "#1F1F1F" : "#212121",
    white: isDark ? "#F5F5F5" : "#F1F3F5",
    primaryShade: { light: 5, dark: 5 },
    primaryColor: "violet",
    colorScheme,
  };
};

export const Mantine = ({ children }: PropsWithChildren) => {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "color-scheme",
    defaultValue: preferredColorScheme ?? "dark",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

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
