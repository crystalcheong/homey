import {
  Box,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  UnstyledButtonProps,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";

import { Route } from "@/data/static";

interface Props extends UnstyledButtonProps {
  routes: Route[];
}
const NestedNavRoutes = ({ routes, ...rest }: Props) => {
  const theme = useMantineTheme();
  return (
    <>
      {routes.map((item) => (
        <UnstyledButton
          key={item.label}
          component={Link}
          href={item.href}
          sx={{
            width: "100%",
            padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
            borderRadius: theme.radius.md,

            ...theme.fn.hover({
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.colors.gray[0],
            }),

            "&:active": theme.activeStyles,
          }}
          {...rest}
        >
          <Group
            noWrap
            align="flex-start"
          >
            {!!item.icon && (
              <ThemeIcon
                size={34}
                variant="default"
                radius="md"
              >
                <item.icon
                  size={22}
                  color={theme.fn.primaryColor()}
                />
              </ThemeIcon>
            )}
            <Box>
              <Text
                size="sm"
                weight={500}
              >
                {item.label}
              </Text>
              <Text
                size="xs"
                color="dimmed"
              >
                {item.description}
              </Text>
            </Box>
          </Group>
        </UnstyledButton>
      ))}
    </>
  );
};

export default NestedNavRoutes;
