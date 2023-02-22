import {
  Affix,
  Button,
  Container,
  ContainerProps,
  LoadingOverlay,
  Paper,
  Transition,
} from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { PropsWithChildren } from "react";
import { TbArrowUp } from "react-icons/tb";

import { Footer, Navbar } from "@/components/Layouts";
import BetaWarning from "@/components/Layouts/BetaWarning";

export type BaseLayoutProps = PropsWithChildren & {
  isLoading?: boolean;
  isBeta?: boolean;
  showAffix?: boolean;
  layoutStylesOverwrite?: ContainerProps["styles"];
};

export const BaseLayout = ({
  children,
  isLoading = false,
  isBeta = true,
  showAffix = true,
  layoutStylesOverwrite,
}: BaseLayoutProps) => {
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
          py="5vh"
          sx={{
            position: "relative",
            // minHeight: "100vh",
            minHeight: "calc(100vh - 350px)",
            ...layoutStylesOverwrite,
          }}
        >
          {isBeta && <BetaWarning />}
          <LoadingOverlay
            visible={isLoading}
            overlayBlur={2}
          />
          {children}
        </Container>
        {showAffix && (
          <Affix position={{ bottom: 20, right: 20 }}>
            <Transition
              transition="slide-up"
              mounted={scroll.y > 0}
            >
              {(transitionStyles) => (
                <Button
                  leftIcon={<TbArrowUp size={16} />}
                  style={transitionStyles}
                  onClick={() => scrollTo({ y: 0 })}
                >
                  Scroll to top
                </Button>
              )}
            </Transition>
          </Affix>
        )}
      </Paper>
      <Footer.Base />
    </>
  );
};

export default BaseLayout;
