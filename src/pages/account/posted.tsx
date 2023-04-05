import { Badge, useMantineTheme } from "@mantine/core";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { Layout, Provider } from "@/components";
const PropertyGrid = dynamic(() => import("@/components/Properties/Grid"));
const BetaWarning = dynamic(() => import("@/components/Layouts/BetaWarning"));
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));

import { useIsTablet } from "@/utils";

import EmptyListing from "~/assets/images/empty-listing.svg";

const AgentPostedPage = () => {
  const theme = useMantineTheme();
  const isTablet = useIsTablet(theme);

  const router = useRouter();
  const { data: sessionData, status: sessionStatus } = useSession();
  const isAuth = !!sessionData;
  const isAuthLoading: boolean = sessionStatus === "loading";

  //#endregion  //*======== Pre-Render Checks ===========

  useEffect(() => {
    if (!isAuthLoading && !isAuth) {
      router.replace("/account/signIn");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, isAuthLoading]);

  //#endregion  //*======== Pre-Render Checks ===========

  return (
    <Layout.Base
      seo={{
        templateTitle: "Posted Listings",
      }}
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <BetaWarning alwaysDisplay />

      <Provider.RenderGuard renderIf={isAuth}>
        <PropertyGrid
          showViewMode={false}
          title="Posted"
          listings={[]}
          // listings={allListings.get(type) ?? []}
          // isLoading={isTypeLoading}
          maxViewableCount={isTablet ? 4 : 3}
          placeholderCount={isTablet ? 4 : 3}
          emptyFallback={
            <UnknownState
              allowRedirect={false}
              svgNode={<EmptyListing />}
              title="No posted listings"
              subtitle={
                <>
                  Stay tuned for feature release 👀
                  <br />
                  <Badge size="xs">Coming Soon</Badge>
                </>
              }
            />
          }
        />
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AgentPostedPage;
