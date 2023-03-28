import { Property, User, UserSavedProperty } from "@prisma/client";
import { create } from "zustand";

import { innerApi } from "@/utils/api";
import { createSelectors } from "@/utils/store";

export type SavedListing = UserSavedProperty & {
  property: Property;
};

interface State {
  currentUser: User | null;
  savedListings: SavedListing[];
}

interface Mutators {
  getSavedListing: (
    listingId: SavedListing["propertyId"]
  ) => SavedListing | null;
  getSavedListings: () => Promise<SavedListing[]>;
}

interface Store extends State, Mutators {}

//#endregion  //*======== Universal Functions ===========

const getSavedListing = (
  savedListings: SavedListing[] = [],
  listingId: SavedListing["propertyId"] = ""
) => {
  if (!savedListings?.length || !listingId.length) return null;

  const savedListingIdx: number = savedListings.findIndex(
    ({ propertyId }) => propertyId === listingId
  );
  if (savedListingIdx < 0) return null;
  const savedListing: SavedListing = savedListings[savedListingIdx];

  return savedListing;
};

//#endregion  //*======== Universal Functions ===========

const store = create<Store>()(
  // persist(
  (set, get) => ({
    currentUser: null,
    savedListings: [],

    getSavedListing: (listingId: SavedListing["propertyId"]) =>
      getSavedListing(get().savedListings, listingId),
    getSavedListings: async () => {
      const savedListings: SavedListing[] = [];

      const currentUser: User | null = get().currentUser;
      if (currentUser) {
        const userSavedListings: SavedListing[] =
          (await innerApi.account.getUserSaved.query({
            id: currentUser.id,
          })) ?? [];

        savedListings.push(...userSavedListings);
      }

      set((state) => ({
        savedListings: savedListings ?? state.savedListings,
      }));
      return savedListings;
    },
  })
  //   {
  //     name: "account",
  //     storage: createJSONStorage(() => sessionStorage),
  //     partialize: (state) =>
  //       Object.fromEntries(
  //         Object.entries(state).filter(([key]) => cachedStates.includes(key))
  //       ),
  //   }
  // )
);

export const useAccountStore = createSelectors(store);
