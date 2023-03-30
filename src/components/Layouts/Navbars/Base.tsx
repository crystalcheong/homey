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
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Fragment, useRef, useState } from "react";
import {
  TbBuildingCommunity,
  TbChevronDown,
  TbChevronLeft,
  TbChevronRight,
  TbChevronUp,
} from "react-icons/tb";

import { AccountMenulist, NavRoutes } from "@/data/static";
import { SavedListing, useAccountStore } from "@/data/stores";

import AuthActions from "@/components/Layouts/AuthActions";
import NestedNavRoutes from "@/components/Layouts/NestedNavRoutes";
import UserButton from "@/components/Layouts/UserButton";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

import { getInsertedArray } from "@/utils";
import { api } from "@/utils/api";
import { logger } from "@/utils/debug";
import { useIsMobile, useIsTablet } from "@/utils/dom";

export function HeaderMegaMenu() {
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);
  const isTablet = useIsTablet(theme);
  const { data: sessionData } = useSession();

  const isAuth = !!sessionData;
  const isDark: boolean = theme.colorScheme === "dark";
  const drawerViewport = useRef<HTMLDivElement>(null);

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [accDrawerOpened, { toggle: toggleAccDrawer }] = useDisclosure(false);
  const [, setUserMenuOpened] = useState<boolean>(false);
  const [linksOpened, setLinkOpened] = useState<string>("");

  const currentUser = useAccountStore.use.currentUser();
  const isAgentUser: boolean =
    !!(currentUser?.propertyAgent ?? []).length ?? false;
  const isVerifiedAgentUser: boolean =
    isAgentUser && (currentUser?.propertyAgent?.[0]?.isVerified ?? false);

  const agentMenuList: typeof AccountMenulist = isVerifiedAgentUser
    ? [
        {
          label: "Posted Listings",
          icon: TbBuildingCommunity,
          href: `/account/posted`,
        },
      ]
    : [];
  const accountMenuList = getInsertedArray(AccountMenulist, 1, agentMenuList);

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

  api.account.getUserByEmail.useQuery(
    {
      email: sessionData?.user?.email ?? "",
    },
    {
      enabled: isAuth,
      onSuccess: (data) => {
        logger("Base.tsx line 173", { data });

        const userSavedListings: SavedListing[] = data?.propertySaved ?? [];
        useAccountStore.setState(() => ({
          currentUser: data,
          savedListings: userSavedListings,
        }));
      },
    }
  );

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
                const isActiveRoute: boolean =
                  href === "/"
                    ? router.asPath === href
                    : router.asPath.includes(href);
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
                    styles={(theme) => ({
                      inner: {
                        ...(!isActiveRoute && {
                          color: isDark ? theme.white : theme.black,
                        }),
                      },
                    })}
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
                        styles={(theme) => ({
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
                        })}
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
                              Looking for your dream abode?
                            </Text>
                            <Text
                              size="xs"
                              color="dimmed"
                            >
                              {!isAuth
                                ? "Join us and discover the perfect property for you."
                                : "Discover and save your favourite properties"}
                            </Text>
                          </Box>
                          <Button
                            variant="default"
                            component={Link}
                            href={
                              !isAuth
                                ? "/account/auth/signUp"
                                : "/account/saved"
                            }
                          >
                            {!isAuth ? "Get started" : "View Favourites"}
                          </Button>
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
              {currentUser ? (
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
                        user={currentUser}
                        icon={<TbChevronDown />}
                      />
                    </Menu.Target>

                    <Menu.Dropdown>
                      {accountMenuList.map((item) => (
                        <Menu.Item
                          key={`accMenu-${item.label}`}
                          component={Link}
                          href={item.href || "#"}
                          {...(!!item.onClick && {
                            onClick: item.onClick,
                          })}
                          icon={
                            item.icon ? (
                              <item.icon
                                size={14}
                                color={theme.fn.primaryColor()}
                              />
                            ) : null
                          }
                        >
                          {item.label}
                        </Menu.Item>
                      ))}
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
          title={
            <Group position="apart">
              <Logo hideBrand />

              <ThemeToggle />
            </Group>
          }
          zIndex={1000000}
          styles={(theme) => ({
            header: {
              marginBottom: theme.spacing.xs,
              marginTop: theme.spacing.xs,
            },
            title: {
              width: "100%",
            },
          })}
        >
          <ScrollArea
            viewportRef={drawerViewport}
            type="never"
            sx={{
              height: "calc(80vh - 60px)",
              paddingLeft: theme.spacing.md,
              paddingRight: theme.spacing.md,
            }}
            mx="-md"
          >
            <Divider
              my="sm"
              color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
            />

            {!accDrawerOpened &&
              NavRoutes.map(({ label, href, nodes = [] }) => {
                const hasNodes = !!nodes.length;
                const isActiveRoute: boolean = router.asPath === href;
                const isLinksOpened: boolean = hasNodes && linksOpened == label;

                const action = () => {
                  if (hasNodes) {
                    setLinkOpened(isLinksOpened ? "" : label);
                    if (isLinksOpened) drawerScrollTo("center");
                    return;
                  }

                  closeDrawer();
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
                      styles={(theme) => ({
                        root: {
                          height: 42,
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        },
                        inner: {
                          color: isDark ? theme.white : theme.black,
                        },
                      })}
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

            {accDrawerOpened &&
              accountMenuList.map((item) => {
                const isActiveRoute: boolean = router.asPath === item.href;
                return (
                  <Button
                    key={`accDrawer-${item.label}`}
                    component={Link}
                    href={item.href || "#"}
                    {...(!!item.onClick && {
                      onClick: item.onClick,
                    })}
                    compact
                    variant={isActiveRoute ? "light" : "subtle"}
                    styles={(theme) => ({
                      root: {
                        height: 42,
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      },
                      inner: {
                        color: isDark ? theme.white : theme.black,
                      },
                    })}
                  >
                    {item.label}
                  </Button>
                );
              })}
          </ScrollArea>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Container>
            {currentUser && (
              <UserButton
                user={currentUser}
                onClick={toggleAccDrawer}
                icon={
                  accDrawerOpened ? (
                    <TbChevronLeft size={16} />
                  ) : (
                    <TbChevronRight size={16} />
                  )
                }
              />
            )}
            {!isAuth && (
              <Group
                position="center"
                grow
                pb="xl"
                px="md"
                mt="md"
              >
                <AuthActions
                  session={sessionData}
                  hidePostAuth
                />
              </Group>
            )}
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
