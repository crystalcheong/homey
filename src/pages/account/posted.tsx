import { useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { Layout, Property, Provider } from "@/components";
import BetaWarning from "@/components/Layouts/BetaWarning";
import UnknownState from "@/components/Layouts/UnknownState";

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
      layoutStylesOverwrite={{
        display: "flex",
        flexDirection: "column",
        gap: "5vh",
      }}
    >
      <BetaWarning />

      <Provider.RenderGuard renderIf={isAuth}>
        <Property.Grid
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
              subtitle={<>Work in Progress</>}
            />
          }
        />
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AgentPostedPage;
