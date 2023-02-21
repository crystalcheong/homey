import {
  Anchor,
  Avatar,
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  Container,
  createStyles,
  Divider,
  Drawer,
  Group,
  Header,
  HoverCard,
  Menu,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
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

import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

import { useIsMobile } from "@/utils/dom";
import { getNameInitials } from "@/utils/helpers";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
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
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: -theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md}px ${theme.spacing.md * 2}px`,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
}));

const mockdata = [
  {
    icon: TbCode,
    title: "Open source",
    description: "This Pokémon’s cry is very loud and distracting",
  },
  {
    icon: TbCoin,
    title: "Free for everyone",
    description: "The fluid of Smeargle’s tail secretions changes",
  },
  {
    icon: TbBook,
    title: "Documentation",
    description: "Yanma is capable of seeing 360 degrees without",
  },
  {
    icon: TbFingerprint,
    title: "Security",
    description: "The shell’s rounded shape and the grooves on its.",
  },
  {
    icon: TbChartPie3,
    title: "Analytics",
    description: "This Pokémon uses its flying ability to quickly chase",
  },
  {
    icon: TbNotification,
    title: "Notifications",
    description: "Combusken battles with the intensely hot flames it spews",
  },
];

const NavigationRoutes = [
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
];

export function HeaderMegaMenu() {
  const router = useRouter();
  const { classes, theme } = useStyles();
  const isMobile = useIsMobile(theme);
  const isDark: boolean = theme.colorScheme === "dark";

  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);

  const { data: sessionData } = useSession();

  const handleSignIn = () => signIn();
  const handleSignUp = () =>
    router.push(
      {
        pathname: `/account/signUp`,
      },
      undefined,
      { scroll: true }
    );
  const handleSignOut = () => signOut();
  const [, setUserMenuOpened] = useState<boolean>(false);

  const links = mockdata.map((item) => (
    <UnstyledButton
      className={classes.subLink}
      key={item.title}
    >
      <Group
        noWrap
        align="flex-start"
      >
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
        <div>
          <Text
            size="sm"
            weight={500}
          >
            {item.title}
          </Text>
          <Text
            size="xs"
            color="dimmed"
          >
            {item.description}
          </Text>
        </div>
      </Group>
    </UnstyledButton>
  ));

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

          <Group
            spacing="md"
            // className={classes.hiddenMobile}
            sx={{
              height: "100%",
              ...(isMobile && {
                display: "none",
              }),
            }}
          >
            {NavigationRoutes.map(({ label, href }) => {
              const isActiveRoute: boolean = router.asPath === href;
              return (
                <Button
                  key={`link-${label}`}
                  component={Link}
                  href={href}
                  compact
                  variant={isActiveRoute ? "light" : "subtle"}
                  styles={{
                    inner: {
                      ...(!isActiveRoute && {
                        color: isDark ? theme.white : theme.black,
                      }),
                    },
                  }}
                  // className={classes.link}
                >
                  {label}
                </Button>
              );
            })}

            <HoverCard
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
                <a
                  href="#"
                  className={classes.link}
                >
                  <Center inline>
                    <Box
                      component="span"
                      mr={5}
                    >
                      Features
                    </Box>
                    <TbChevronDown
                      size={16}
                      color={theme.fn.primaryColor()}
                    />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
                <Group
                  position="apart"
                  px="md"
                >
                  <Text weight={500}>Features</Text>
                  <Anchor
                    href="#"
                    size="xs"
                  >
                    View all
                  </Anchor>
                </Group>

                <Divider
                  my="sm"
                  mx="-md"
                  color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                />

                <SimpleGrid
                  cols={2}
                  spacing={0}
                >
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group position="apart">
                    <div>
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
                        Their food sources have decreased, and their numbers
                      </Text>
                    </div>
                    <Button variant="default">Get started</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>

          {!isMobile && (
            <Group position="right">
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
                      <UnstyledButton>
                        <Group spacing={8}>
                          <Avatar
                            src={sessionData.user?.image}
                            color="violet"
                            alt="profile-avatar"
                            radius="xl"
                            size={40}
                          >
                            {getNameInitials(sessionData.user?.name ?? "")}
                          </Avatar>
                          <Box mr={3}>
                            <Text
                              weight={500}
                              fz="xs"
                            >
                              {sessionData.user?.name}
                            </Text>
                            {false && (
                              <Text
                                size="xs"
                                color="dimmed"
                              >
                                Renter
                              </Text>
                            )}
                          </Box>
                          <TbChevronDown
                            size={16}
                            color={theme.fn.primaryColor()}
                          />
                        </Group>
                      </UnstyledButton>
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
                      <Menu.Item icon={<TbSettings size={14} />}>
                        Account settings
                      </Menu.Item>
                      <Menu.Item icon={<TbSwitchHorizontal size={14} />}>
                        Change account
                      </Menu.Item>
                      <Menu.Item
                        icon={<TbLogout size={14} />}
                        onClick={handleSignOut}
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
                <>
                  <Button
                    variant="default"
                    onClick={handleSignIn}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSignUp}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Group>
          )}

          <Burger
            size="sm"
            opened={drawerOpened}
            onClick={toggleDrawer}
            className={classes.hiddenDesktop}
          />
        </Container>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea
          sx={{ height: "calc(100vh - 60px)" }}
          mx="-md"
        >
          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          {NavigationRoutes.map(({ label, href }) => {
            const isActiveRoute: boolean = router.asPath === href;
            return (
              <Button
                key={`link-${label}`}
                component={Link}
                href={href}
                compact
                variant={isActiveRoute ? "light" : "subtle"}
                // className={classes.link}
                styles={{
                  root: {
                    ...(isMobile && {
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
              </Button>
            );
          })}

          <UnstyledButton
            className={classes.link}
            onClick={toggleLinks}
          >
            <Center inline>
              <Box
                component="span"
                mr={5}
              >
                Features
              </Box>

              {linksOpened ? (
                <TbChevronUp
                  size={16}
                  color={theme.fn.primaryColor()}
                />
              ) : (
                <TbChevronDown
                  size={16}
                  color={theme.fn.primaryColor()}
                />
              )}
            </Center>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>

          <Divider
            my="sm"
            color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
          />

          <Group
            position="center"
            grow
            pb="xl"
            px="md"
          >
            <Button
              variant="default"
              onClick={handleSignIn}
            >
              Log in
            </Button>
            <Button
              variant="default"
              onClick={handleSignUp}
            >
              Sign up
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </>
  );
}

// export type BaseNavbarProps = PropsWithChildren;

export const BaseNavbar = () => {
  return <HeaderMegaMenu />;
};

export default BaseNavbar;
