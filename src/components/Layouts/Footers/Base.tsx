import {
  ActionIcon,
  Box,
  Container,
  createStyles,
  Footer,
  Group,
  Space,
  Text,
} from "@mantine/core";
import Link from "next/link";
import React from "react";
import {
  TbBrandInstagram,
  TbBrandTwitter,
  TbBrandYoutube,
} from "react-icons/tb";

import { ListingCategories } from "@/data/clients/ninetyNine";

import { Route } from "@/components/Layouts/Navbars/Base";
import Logo from "@/components/Logo";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 120,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[2],
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  logo: {
    maxWidth: 400,

    [theme.fn.smallerThan("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },

  description: {
    marginTop: 5,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  wrapper: {
    width: 160,
  },

  link: {
    display: "block",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    marginBottom: theme.spacing.xs / 2,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  social: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
    },
  },
}));

interface FooterLinksProps {
  linkRows: (Route & {
    nodes?: Route[];
  })[][];
}

export function FooterLinks({ linkRows }: FooterLinksProps) {
  const { classes } = useStyles();

  const currentYear: number = new Date().getFullYear();
  const groups = linkRows.map((row, idx) => (
    <Box
      key={`footerLinkRow-${idx}`}
      className={classes.groups}
    >
      {row.map((group) => {
        const links = (group.nodes ?? []).map((link, index) => (
          <Text
            key={index}
            className={classes.link}
            component={Link}
            href={link.href}
            // onClick={(event) => event.preventDefault()}
          >
            {link.label}
          </Text>
        ));

        return (
          <Box
            className={classes.wrapper}
            key={group.label}
          >
            <Text
              className={classes.title}
              component={Link}
              href={group.href}
            >
              {group.label}
            </Text>
            {links}
          </Box>
        );
      })}
    </Box>
  ));

  return (
    <Box
      component="footer"
      className={classes.footer}
    >
      <Container className={classes.inner}>
        <Box className={classes.logo}>
          <Logo />
          <Text
            component="p"
            size="xs"
            color="dimmed"
            className={classes.description}
          >
            Find your dream home in Singapore
          </Text>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "2em",
          }}
        >
          {groups}
        </Box>
      </Container>
      <Container className={classes.afterFooter}>
        <Text
          color="dimmed"
          size="xs"
        >
          &copy; {currentYear} Homey. All rights reserved.
        </Text>

        <Group
          spacing={0}
          className={classes.social}
          position="right"
          noWrap
        >
          <ActionIcon size="lg">
            <TbBrandTwitter size={18} />
          </ActionIcon>
          <ActionIcon size="lg">
            <TbBrandYoutube size={18} />
          </ActionIcon>
          <ActionIcon size="lg">
            <TbBrandInstagram size={18} />
          </ActionIcon>
        </Group>
      </Container>
    </Box>
  );
}

const BaseFooter = () => {
  const topRow: (Route & {
    nodes?: Route[];
  })[] = [
    {
      label: "Buy Properties",
      href: "/property/sale",
      nodes: ListingCategories.map((category) => ({
        label: `${category} for Sale`,
        href: `/property/sale?category=${category}`,
      })),
    },
    {
      label: "Rent Properties",
      href: "/property/rent",
      nodes: ListingCategories.map((category) => ({
        label: `${category} for Rent`,
        href: `/property/rent?category=${category}`,
      })),
    },
    {
      label: "Explore Singapore",
      href: "#",
      nodes: [
        {
          label: "Neighbourhoods",
          href: "/explore/neighbourhoods",
        },
        {
          label: "Condo Launches",
          href: "/explore/new-launches",
        },
      ],
    },
  ];

  const bottomRow: typeof topRow = [
    {
      label: "Company",
      href: "#",
      nodes: [
        {
          label: "Privacy Policy",
          href: "/info/privacy",
        },
        {
          label: "Terms & Conditions",
          href: "/info/terms",
        },
      ],
    },
  ];

  const linkRows: FooterLinksProps["linkRows"] = [topRow, bottomRow];

  return (
    <>
      <Space h={380} />
      <Footer
        height={500}
        sx={{
          position: "fixed",
          inset: "auto 0 0",
          zIndex: 0,
        }}
      >
        <FooterLinks linkRows={linkRows} />
      </Footer>
    </>
  );
};

export default BaseFooter;
