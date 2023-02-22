import {
  ActionIcon,
  Container,
  createStyles,
  Footer,
  Group,
  Space,
  Text,
} from "@mantine/core";
import React from "react";
import {
  TbBrandInstagram,
  TbBrandTwitter,
  TbBrandYoutube,
} from "react-icons/tb";

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
        : theme.colors.gray[0],
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  logo: {
    maxWidth: 200,

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
  data: (Route & {
    nodes?: Route[];
  })[];
}

export function FooterLinks({ data }: FooterLinksProps) {
  const { classes } = useStyles();

  const currentYear: number = new Date().getFullYear();
  const groups = data.map((group) => {
    const links = (group.nodes ?? []).map((link, index) => (
      <Text<"a">
        key={index}
        className={classes.link}
        component="a"
        href={link.href}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </Text>
    ));

    return (
      <div
        className={classes.wrapper}
        key={group.label}
      >
        <Text className={classes.title}>{group.label}</Text>
        {links}
      </div>
    );
  });

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Logo />
          <Text
            size="xs"
            color="dimmed"
            className={classes.description}
          >
            Build fully functional accessible web applications faster than ever
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text
          color="dimmed"
          size="sm"
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
    </footer>
  );
}

const BaseFooter = () => {
  const data: (Route & {
    nodes?: Route[];
  })[] = [
    {
      label: "About",
      href: "#",
      nodes: [
        {
          label: "Features",
          href: "#",
        },
        {
          label: "Pricing",
          href: "#",
        },
        {
          label: "Support",
          href: "#",
        },
        {
          label: "Forums",
          href: "#",
        },
      ],
    },
    {
      label: "Project",
      href: "#",
      nodes: [
        {
          label: "Contribute",
          href: "#",
        },
        {
          label: "Media assets",
          href: "#",
        },
        {
          label: "Changelog",
          href: "#",
        },
        {
          label: "Releases",
          href: "#",
        },
      ],
    },
    {
      label: "Community",
      href: "#",
      nodes: [
        {
          label: "Join Discord",
          href: "#",
        },
        {
          label: "Follow on Twitter",
          href: "#",
        },
        {
          label: "Email newsletter",
          href: "#",
        },
        {
          label: "GitHub discussions",
          href: "#",
        },
      ],
    },
  ];
  return (
    <>
      <Space h={300} />
      <Footer
        height={400}
        sx={{
          position: "fixed",
          inset: "auto 0 0",
          zIndex: 0,
        }}
      >
        <FooterLinks data={data} />
      </Footer>
    </>
  );
};

export default BaseFooter;
