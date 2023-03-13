import {
  ActionIcon,
  Affix,
  Button,
  Container,
  ContainerProps,
  LoadingOverlay,
  Paper,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { PropsWithChildren } from "react";
import { TbArrowUp } from "react-icons/tb";

import { Footer, Navbar } from "@/components/Layouts";

import { useIsMobile } from "@/utils/dom";

export type BaseLayoutProps = PropsWithChildren & {
  showAffix?: boolean;
  isLoading?: boolean;
  layoutStylesOverwrite?: ContainerProps["styles"];
};

export const BaseLayout = ({
  children,
  showAffix = true,
  isLoading = false,
  layoutStylesOverwrite,
}: BaseLayoutProps) => {
  const theme = useMantineTheme();
  const isMobile = useIsMobile(theme);
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <>
      <Navbar.Base />
      <Paper
        py="5vh"
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
        }}
      >
        <Container
          sx={{
            position: "relative",
            minHeight: "calc(100vh - 350px)",
            ...layoutStylesOverwrite,
          }}
        >
          {isLoading && (
            <LoadingOverlay
              visible={isLoading}
              overlayBlur={2}
            />
          )}
          {children}
        </Container>
        {showAffix && (
          <Affix position={{ bottom: 20, right: 20 }}>
            <Transition
              transition="slide-up"
              mounted={scroll.y > 0}
            >
              {(transitionStyles) =>
                !isMobile ? (
                  <Button
                    leftIcon={<TbArrowUp size={16} />}
                    style={transitionStyles}
                    onClick={() => scrollTo({ y: 0 })}
                  >
                    Scroll to top
                  </Button>
                ) : (
                  <ActionIcon
                    variant="filled"
                    color={theme.fn.primaryColor()}
                    style={transitionStyles}
                    onClick={() => scrollTo({ y: 0 })}
                  >
                    <TbArrowUp size={16} />
                  </ActionIcon>
                )
              }
            </Transition>
          </Affix>
        )}
      </Paper>
      <Footer.Base />
    </>
  );
};

export default BaseLayout;
