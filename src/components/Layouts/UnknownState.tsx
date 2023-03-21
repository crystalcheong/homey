import {
  Box,
  BoxProps,
  Button,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useState } from "react";
import { TbArrowNarrowLeft } from "react-icons/tb";

export function useRedirectAfterSomeSeconds(redirectTo = "", seconds = 5) {
  const [secondsRemaining, setSecondsRemaining] = useState(seconds);
  const router = useRouter();

  useEffect(() => {
    if (secondsRemaining === 0) router.push("/");

    const timer = setTimeout(() => {
      setSecondsRemaining((prevSecondsRemaining) => prevSecondsRemaining - 1);
      if (secondsRemaining === 1) router.push(redirectTo);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [router, secondsRemaining, redirectTo]);

  return { secondsRemaining };
}

interface Props extends BoxProps {
  svgNode: ReactNode;
  title: string | ReactNode;
  subtitle: string | ReactNode;
  hideBackButton?: boolean;
}

const UnknownState = ({
  svgNode,
  title,
  subtitle,
  children,
  hideBackButton = false,
  ...rest
}: Props) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const { secondsRemaining } = useRedirectAfterSomeSeconds("/", 5);

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
        <br />
        Redirecting to homepage in
        <Text
          component="span"
          variant="gradient"
          fw={800}
        >
          &nbsp;{secondsRemaining} {secondsRemaining > 1 ? "seconds" : "second"}
        </Text>
        .
      </Text>

      {!hideBackButton && (
        <Button
          variant="light"
          onClick={() => router.back()}
          leftIcon={<TbArrowNarrowLeft />}
          mt={8}
        >
          Go back
        </Button>
      )}

      {children}
    </Box>
  );
};

export default UnknownState;
