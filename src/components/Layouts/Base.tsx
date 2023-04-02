import {
  ActionIcon,
  Affix,
  Button,
  Container,
  ContainerProps,
  Paper,
  Transition,
  useMantineTheme,
} from "@mantine/core";
import { useWindowScroll } from "@mantine/hooks";
import { PropsWithChildren } from "react";
import { TbArrowUp } from "react-icons/tb";

import { Footer, Navbar } from "@/components/Layouts";
import LogoLoader from "@/components/LogoLoader";
import Seo, { SeoProps } from "@/components/Providers/Seo";

import { useIsMobile } from "@/utils/dom";

export type BaseLayoutProps = PropsWithChildren & {
  showAffix?: boolean;
  isLoading?: boolean;
  layoutStylesOverwrite?: ContainerProps["styles"];
  seo?: Partial<SeoProps>;
};

export const BaseLayout = ({
  seo,
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
      <Seo {...seo} />
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

            ...(isLoading && {
              height: "100vh",
              overflow: "hidden",
            }),
          }}
        >
          <LogoLoader visible={isLoading} />
          {children}
        </Container>
        <Affix
          hidden={!showAffix}
          position={{ bottom: 20, right: 20 }}
        >
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
      </Paper>
      <Footer.Base />
    </>
  );
};

export default BaseLayout;
