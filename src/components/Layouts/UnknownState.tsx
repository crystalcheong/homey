import {
  Box,
  BoxProps,
  Button,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { ReactNode } from "react";
import { TbArrowNarrowLeft } from "react-icons/tb";

interface Props extends BoxProps {
  svgNode: ReactNode;
  title: string | ReactNode;
  subtitle: string | ReactNode;
}

const UnknownState = ({
  svgNode,
  title,
  subtitle,
  children,
  ...rest
}: Props) => {
  const router = useRouter();
  const theme = useMantineTheme();

  return (
    <Box
      component="article"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.xs,
        placeContent: "center",
        placeItems: "center",
      }}
      {...rest}
    >
      <Box
        sx={{
          resize: "both",
          overflow: "auto",
          width: "13em",
          margin: "0 auto",

          "&>*": {
            height: "95%",
            width: "95%",
          },
        }}
      >
        {svgNode}
      </Box>

      <Title
        order={2}
        size="h5"
        tt="capitalize"
        align="center"
      >
        {title}
      </Title>

      <Text
        component="p"
        size="sm"
        m={0}
        color="dimmed"
        align="center"
        fw={500}
      >
        {subtitle}
      </Text>

      <Button
        variant="light"
        onClick={() => router.back()}
        leftIcon={<TbArrowNarrowLeft />}
        mt={8}
      >
        Go back
      </Button>
      {children}
    </Box>
  );
};

export default UnknownState;
