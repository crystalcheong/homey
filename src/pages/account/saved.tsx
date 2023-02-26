import { PropertyType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { TbBookmark } from "react-icons/tb";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import {
  SavedListing,
  useAccountStore,
  useNinetyNineStore,
} from "@/data/stores";

import { Layout, Property, Provider } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

import EmptySaved from "~/assets/images/empty-saved.svg";

const AccountSavedPage = () => {
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const userSavedListings: SavedListing[] = useAccountStore.use.savedListings();

  const [...allSavedListings]: Listing[] = (
    api.useQueries((t) =>
      userSavedListings.map(({ property }) => {
        const isRent: boolean = property.type === PropertyType.RENT;
        return t.ninetyNine.getClusterListings(
          {
            listingId: property.id,
            listingType: ListingTypes[isRent ? 0 : 1],
            clusterId: property.clusterId,
          },
          {
            onSuccess(data) {
              logger("saved.tsx line 29", { data });
              if (!data) return;
              useNinetyNineStore.setState((state) => ({
                savedListings: [...state.savedListings, data],
              }));
              return data;
            },
          }
        );
      })
    ) ?? []
  )
    .filter(({ data }) => !!data)
    .map(({ data }) => data) as Listing[];

  //#endregion  //*======== Pre-Render Checks ===========
  // useEffect(() => {
  //   if (!isAuth) {
  //     router.replace("/");
  //     return;
  //   }
  // }, [isAuth, router]);

  //#endregion  //*======== Pre-Render Checks ===========

  return (
    <Layout.Base showAffix={!!allSavedListings.length}>
      <Provider.RenderGuard renderIf={isAuth}>
        <Property.Grid
          listings={allSavedListings}
          allowSaveListing={isAuth}
          title="Saved"
          emptyFallback={
            <UnknownState
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
