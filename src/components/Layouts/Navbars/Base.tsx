import {
  Box,
  Burger,
  Button,
  Collapse,
  Container,
  Divider,
  Drawer,
  Group,
  Header,
  HoverCard,
  Menu,
  ScrollArea,
  SimpleGrid,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { Fragment, useRef, useState } from "react";
import { IconType } from "react-icons";
import {
  TbBook,
  TbChartPie3,
  TbChevronDown,
  TbChevronUp,
  TbCode,
  TbCoin,
  TbFingerprint,
  TbHeart,
  TbLogout,
  TbMessage,
  TbNotification,
  TbPlayerPause,
  TbSettings,
  TbStar,
  TbSwitchHorizontal,
  TbTrash,
} from "react-icons/tb";

import { ListingTypes } from "@/data/clients/ninetyNine";

import AuthActions from "@/components/Layouts/AuthActions";
import NestedNavRoutes from "@/components/Layouts/NestedNavRoutes";
import UserButton from "@/components/Layouts/UserButton";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

import { useIsMobile, useIsTablet } from "@/utils/dom";
export interface Route {
  label: string;
  href: string;
  icon?: IconType;
  description?: string;
}

const NavRoutes: (Route & {
  nodes?: Route[];
})[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Rent",
    href: `/property/${ListingTypes[0]}`,
  },
  {
    label: "Buy",
    href: `/property/${ListingTypes[1]}`,
  },
  {
    label: "Feature",
    href: `#`,
    nodes: [
      {
        icon: TbCode,
        label: "Open source",
        href: "",
        description: "This Pokémon’s cry is very loud and distracting",
      },
      {
        icon: TbCoin,
        label: "Free for everyone",
        href: "",
        description: "The fluid of Smeargle’s tail secretions changes",
      },
      {
        icon: TbBook,
        label: "Documentation",
        href: "",
        description: "Yanma is capable of seeing 360 degrees without",
      },
    ],
  },
  {
    label: "Feature 2",
    href: `#`,
    nodes: [
      {
        icon: TbFingerprint,
        label: "Security",
        href: "",
        description: "The shell’s rounded shape and the grooves on its.",
      },
      {
        icon: TbChartPie3,
        label: "Analytics",
        href: "",
        description: "This Pokémon uses its flying ability to quickly chase",
      },
      {
        icon: TbNotification,
        label: "Notifications",
        href: "",
        description: "Combusken battles with the intensely hot flames it spews",
      },
    ],
  },
];

export function HeaderMegaMenu() {
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);
  const isTablet = useIsTablet(theme);
  const { data: sessionData } = useSession();

  const isDark: boolean = theme.colorScheme === "dark";
  const drawerViewport = useRef<HTMLDivElement>(null);

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [, setUserMenuOpened] = useState<boolean>(false);
  const [linksOpened, setLinkOpened] = useState<string>("");

  const drawerScrollTo = (position: "top" | "center" | "bottom" = "top") => {
    if (!drawerViewport) return;
    switch (position) {
      case "top": {
        drawerViewport?.current?.scrollTo({ top: 0, behavior: "smooth" });
        break;
      }
      case "center": {
        drawerViewport?.current?.scrollTo({
          top: drawerViewport.current.scrollHeight / 2,
          behavior: "smooth",
        });
        break;
      }
      case "bottom": {
        drawerViewport?.current?.scrollTo({
          top: drawerViewport.current.scrollHeight,
          behavior: "smooth",
        });
        break;
      }
    }
  };

  return (
    <>
      <Header
        height={60}
        sx={{
          position: "sticky",
          top: 0,
        }}
      >
        <Container
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "row",
            placeContent: "space-between",
            placeItems: "center",
          }}
        >
          <Logo />

          {!isTablet && (
            <Group
              spacing="md"
              sx={{
                height: "100%",
              }}
            >
              {NavRoutes.map(({ label, href, nodes = [] }) => {
                const hasNodes = !!nodes.length;
                const isActiveRoute: boolean = router.asPath === href;
                const isLinksOpened: boolean = hasNodes && linksOpened == label;

                const action = () => {
                  if (hasNodes) {
                    setLinkOpened(isLinksOpened ? "" : label);
                    return;
                  }
                  router.push(
                    {
                      pathname: href,
                    },
                    undefined,
                    { scroll: true }
                  );
                };

                return !nodes.length ? (
                  <Button
                    key={`link-${label}`}
                    onClick={action}
                    compact
                    variant={isActiveRoute ? "light" : "subtle"}
                    styles={{
                      inner: {
                        ...(!isActiveRoute && {
                          color: isDark ? theme.white : theme.black,
                        }),
                      },
                    }}
                  >
                    {label}

                    {hasNodes && (
                      <TbChevronDown
                        size={16}
                        color={theme.fn.primaryColor()}
                      />
                    )}
                  </Button>
                ) : (
                  <HoverCard
                    key={`link-${label}`}
                    width={600}
                    position="bottom"
                    radius="md"
                    shadow="md"
                    withinPortal
                    transition="pop-top-right"
                    openDelay={100}
                    closeDelay={400}
                  >
                    <HoverCard.Target>
                      <Button
                        key={`link-${label}`}
                        compact
                        variant={isActiveRoute ? "light" : "subtle"}
                        styles={{
                          root: {
                            display: "flex",
                            flexDirection: "row",
                            placeItems: "center",
                            gap: theme.spacing.sm,
                          },
                          inner: {
                            ...(!isActiveRoute && {
                              color: isDark ? theme.white : theme.black,
                            }),
                          },
                        }}
                      >
                        {label}

                        <TbChevronDown
                          size={16}
                          color={theme.fn.primaryColor()}
                        />
                      </Button>
                    </HoverCard.Target>

                    <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                      <SimpleGrid
                        cols={2}
                        spacing={0}
                      >
                        <NestedNavRoutes routes={nodes} />
                      </SimpleGrid>

                      <Box
                        sx={{
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[7]
                              : theme.colors.gray[0],
                          margin: -theme.spacing.md,
                          marginTop: theme.spacing.sm,
                          padding: `${theme.spacing.md}px ${
                            theme.spacing.md * 2
                          }px`,
                          paddingBottom: theme.spacing.xl,
                          borderTop: `1px solid ${
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[5]
                              : theme.colors.gray[1]
                          }`,
                        }}
                      >
                        <Group position="apart">
                          <Box>
                            <Text
                              weight={500}
                              size="sm"
                            >
                              Get started
                            </Text>
                            <Text
                              size="xs"
                              color="dimmed"
                            >
                              Their food sources have decreased, and their
                              numbers
                            </Text>
                          </Box>
                          <Button variant="default">Get started</Button>
                        </Group>
                      </Box>
                    </HoverCard.Dropdown>
                  </HoverCard>
                );
              })}
            </Group>
          )}

          {!isTablet && (
            <Group
              position="right"
              sx={{
                flexWrap: "nowrap",
              }}
            >
              <ThemeToggle />
              <Divider
                size="xs"
                color={theme.primaryColor}
                orientation="vertical"
              />
              {sessionData ? (
                <Group>
                  <Menu
                    width={260}
                    position="bottom-end"
                    transition="pop-top-right"
                    trigger="hover"
                    openDelay={100}
                    closeDelay={400}
                    onClose={() => setUserMenuOpened(false)}
                    onOpen={() => setUserMenuOpened(true)}
                  >
                    <Menu.Target>
                      <UserButton
                        name={sessionData.user.name ?? ""}
                        icon={<TbChevronDown />}
                      />
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        icon={
                          <TbHeart
                            size={14}
                            color={theme.colors.red[6]}
                          />
                        }
                      >
                        Liked posts
                      </Menu.Item>
                      <Menu.Item
                        icon={
                          <TbStar
                            size={14}
                            color={theme.colors.yellow[6]}
                          />
                        }
                      >
                        Saved posts
                      </Menu.Item>
                      <Menu.Item
                        icon={
                          <TbMessage
                            size={14}
                            color={theme.colors.blue[6]}
                          />
                        }
                      >
                        Your comments
                      </Menu.Item>

                      <Menu.Label>Settings</Menu.Label>
                      <Menu.Item
                        icon={<TbSettings size={14} />}
                        onClick={() => {
                          router.push(
                            {
                              pathname: `/account`,
                            },
                            undefined,
                            { scroll: true }
                          );
                        }}
                      >
                        Account settings
                      </Menu.Item>
                      <Menu.Item icon={<TbSwitchHorizontal size={14} />}>
                        Change account
                      </Menu.Item>
                      <Menu.Item
                        icon={<TbLogout size={14} />}
                        onClick={() => signOut()}
                      >
                        Logout
                      </Menu.Item>

                      <Menu.Divider />

                      <Menu.Label>Danger zone</Menu.Label>
                      <Menu.Item icon={<TbPlayerPause size={14} />}>
                        Pause subscription
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        icon={<TbTrash size={14} />}
                      >
                        Delete account
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              ) : (
                <AuthActions session={sessionData} />
              )}
            </Group>
          )}

          {isTablet && (
            <Burger
              size="sm"
              opened={drawerOpened}
              onClick={toggleDrawer}
            />
          )}
        </Container>
      </Header>

      {isTablet && (
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size={isMobile ? "100%" : "md"}
          padding="md"
          title={<Logo hideBrand />}
          zIndex={1000000}
        >
          <ScrollArea
            viewportRef={drawerViewport}
            type="never"
            sx={{ height: "calc(75vh - 60px)" }}
            mx="-md"
          >
            <Divider
              my="sm"
              color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
            />

            {NavRoutes.map(({ label, href, nodes = [] }) => {
              const hasNodes = !!nodes.length;
              const isActiveRoute: boolean = router.asPath === href;
              const isLinksOpened: boolean = hasNodes && linksOpened == label;

              const action = () => {
                if (hasNodes) {
                  setLinkOpened(isLinksOpened ? "" : label);
                  if (isLinksOpened) drawerScrollTo("center");
                  return;
                }
                router.push(
                  {
                    pathname: href,
                  },
                  undefined,
                  { scroll: true }
                );
              };
              return (
                <Fragment key={`link-${label}`}>
                  <Button
                    onClick={action}
                    compact
                    variant={isActiveRoute ? "light" : "subtle"}
                    styles={{
                      root: {
                        ...(isTablet && {
                          height: 42,
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          paddingLeft: theme.spacing.md,
                          paddingRight: theme.spacing.md,
                        }),
                      },
                      inner: {
                        ...(!isActiveRoute && {
                          color: isDark ? theme.white : theme.black,
                        }),
                      },
                    }}
                  >
                    {label}

                    {hasNodes &&
                      (isLinksOpened ? (
                        <TbChevronUp
                          size={16}
                          color={theme.fn.primaryColor()}
                        />
                      ) : (
                        <TbChevronDown
                          size={16}
                          color={theme.fn.primaryColor()}
                        />
                      ))}
                  </Button>
                  {hasNodes && (
                    <Collapse in={isLinksOpened}>
                      <NestedNavRoutes routes={nodes} />
                    </Collapse>
                  )}
                </Fragment>
              );
            })}
          </ScrollArea>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Container>
            {sessionData && (
              <UserButton
                name={sessionData.user.name ?? ""}
                onClick={() => {
                  router.push(
                    {
                      pathname: `/account`,
                    },
                    undefined,
                    { scroll: true }
                  );
                  return;
                }}
              />
            )}
            <Group
              position="center"
              grow
              pb="xl"
              px="md"
              mt="md"
            >
              <AuthActions session={sessionData} />
            </Group>
          </Container>
        </Drawer>
      )}
    </>
  );
}

export const BaseNavbar = () => {
  return <HeaderMegaMenu />;
};

export default BaseNavbar;
