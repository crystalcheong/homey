import { Box, BoxProps, Text, Title } from "@mantine/core";
import React, { ReactNode } from "react";

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
  return (
    <Box
      component="article"
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
        pt="md"
        tt="capitalize"
        align="center"
      >
        {title}
      </Title>

      <Text
        component="p"
        size="sm"
        color="dimmed"
        align="center"
        fw={500}
      >
        {subtitle}
      </Text>

      {children}
    </Box>
  );
};

export default UnknownState;
