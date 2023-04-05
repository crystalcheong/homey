import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { TbBookmark } from "react-icons/tb";

import { parseStringifiedListing, useAccountStore } from "@/data/stores";

import { Layout, Provider } from "@/components";
const PropertyGrid = dynamic(() => import("@/components/Properties/Grid"));
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));

import { SavedListing } from "@/types/account";
import { Listing } from "@/types/ninetyNine";

import EmptySaved from "~/assets/images/empty-saved.svg";

const AccountSavedPage = () => {
  const router = useRouter();
  const { data: sessionData, status: sessionStatus } = useSession();
  const isAuth = !!sessionData;
  const isAuthLoading: boolean = sessionStatus === "loading";

  const userSavedListings: SavedListing[] = useAccountStore.use.savedListings();

  const allSavedListings: Listing[] = useMemo<Listing[]>(
    () =>
      (userSavedListings ?? []).map(({ property }) =>
        parseStringifiedListing<Listing>(property.stringifiedSnapshot)
      ),
    [userSavedListings]
  );

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
      showAffix={!!allSavedListings.length}
      seo={{
        templateTitle: "Saved Listings",
      }}
    >
      <Provider.RenderGuard renderIf={isAuth}>
        <PropertyGrid
          showViewMode={!!allSavedListings.length}
          listings={allSavedListings}
          allowSaveListing={isAuth && !!allSavedListings.length}
          title="Saved"
          emptyFallback={
            <UnknownState
              hidden={isAuthLoading}
              allowRedirect={false}
              svgNode={<EmptySaved />}
              title="No saved listings"
              subtitle={
                <>
                  You can add an item to your favourites by clicking{" "}
                  <TbBookmark style={{ verticalAlign: "middle" }} />
                </>
              }
            />
          }
        />
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountSavedPage;
