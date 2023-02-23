import { PropertyType } from "@prisma/client";
import { useSession } from "next-auth/react";

import { Listing, ListingTypes } from "@/data/clients/ninetyNine";
import {
  SavedListing,
  useAccountStore,
  useNinetyNineStore,
} from "@/data/stores";

import { Layout, Property, Provider } from "@/components";

import { api } from "@/utils/api";
import { logger } from "@/utils/debug";

const AccountSavedPage = () => {
  const { data: sessionData } = useSession();
  const isAuth = !!sessionData;

  const userSavedListings: SavedListing[] = useAccountStore.use.savedListings();

  const [...allSavedListings]: Listing[] = (
    api.useQueries((t) =>
      userSavedListings.map(({ property }) => {
        const isRent: boolean = property.type === PropertyType.RENT;
        return t.ninetyNine.getClusterListing(
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
    <Layout.Base>
      <Provider.RenderGuard renderIf={isAuth}>
        <Property.Grid
          listings={allSavedListings}
          allowSaveListing={isAuth}
          title="Saved Listings"
        />
      </Provider.RenderGuard>
    </Layout.Base>
  );
};

export default AccountSavedPage;
