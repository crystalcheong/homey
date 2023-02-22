import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import { AppRouter } from "@/server/api/root";
import { getBaseUrl } from "@/utils/api";
import { logger } from "@/utils/debug";
import { getUniqueObjectList } from "@/utils/helpers";
import { createSelectors } from "@/utils/store";

interface State {
  currentListing: Listing | null;
  listings: Map<ListingType, Listing[]>;
  pagination: Record<
    ListingType,
    {
      currentCount: number;
      pageSize: number;
      pageNum: number;
    }
  >;
}

interface Mutators {
  updateListings: (listingType: ListingType, newListings: Listing[]) => void;
  getMoreListings: (listingType: ListingType) => void;
  getListing: (
    listingType: ListingType,
    listingId: Listing["id"]
  ) => Listing | null;
}

interface Store extends State, Mutators {}

//#endregion  //*======== Universal Functions ===========

const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

const updateListings = (
  listingType: ListingType,
  newListings: Listing[],
  state: Store
): Partial<Store> => {
  // const currentListings = state.listings;
  const currentListings = state.listings;
  const currentPagination = state.pagination;
  const { currentCount, pageNum } = currentPagination[listingType];

  const updatedListings: Listing[] = getUniqueObjectList(
    (currentListings.get(listingType) ?? []).concat(newListings),
    "id"
  );
  const updatedCurrentCount = (currentCount ?? 0) + updatedListings.length;
  const updatePageNum = (pageNum ?? 0) + 1;

  currentListings.set(listingType, updatedListings);

  const updatedState: Partial<Store> = {
    // listings: {
    //   ...currentListings,
    //   [listingType]: updatedListings,
    // },
    listings: currentListings,
    pagination: {
      ...currentPagination,
      [listingType]: {
        ...currentPagination[listingType],
        currentCount: updatedCurrentCount,
        pageNum: updatePageNum,
      },
    },
  };
  logger("NinetyNine/updateListings", listingType, { updatedState });
  return updatedState;
};

const cachedStates: string[] = ["currentListing"];

//#endregion  //*======== Universal Functions ===========

const store = create<Store>()(
  persist(
    (set, get) => ({
      currentListing: null,
      listings: new Map<ListingType, Listing[]>(
        ListingTypes.map((type) => [type as ListingType, [] as Listing[]])
      ),
      pagination: ListingTypes.reduce(
        (listingMap = {}, type) => ({
          ...listingMap,
          [type]: {
            currentCount: 0,
            pageSize: 30,
            pageNum: 1,
          },
        }),
        {}
      ),
      updateListings: (listingType, newListings) =>
        set((state) => updateListings(listingType, newListings, state)),
      getMoreListings: async (listingType) => {
        const currentPagination = get().pagination;
        const { pageNum } = currentPagination[listingType];
        const newListings: Listing[] =
          (await api.ninetyNine.getListings.query({
            listingType,
            pageNum,
          })) ?? [];
        return set((state) => updateListings(listingType, newListings, state));
      },
      getListing: (listingType, listingId) => {
        // const currentListings: State["listings"] = get().listings;
        const currentListings: State["listings"] = get().listings;
        const currentListing: State["currentListing"] = get().currentListing;
        const currentTypeListings: Listing[] =
          currentListings.get(listingType) ?? [];

        if (!listingId.length) return null;

        // CHECK: If it matches currentListing
        if (currentListing) {
          const isCurrentListing: boolean = currentListing.id === listingId;
          if (isCurrentListing) return currentListing;
        }

        if (!currentTypeListings.length) return null;

        const matchingListings: Listing[] =
          currentTypeListings.filter(({ id }) => id === listingId) ?? [];
        if (!matchingListings.length) return null;

        const matchedListing: Listing = matchingListings[0];
        set((state) => ({
          currentListing: matchedListing ?? state.currentListing,
        }));
        return matchedListing;
      },
    }),
    {
      name: "properties",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => cachedStates.includes(key))
        ),
    }
  )
);

// export const persistentStore = create<State>()(
//   persist(
//     (set, get) => ({
//       listings: ListingTypes.reduce(
//         (listingMap = {}, type) => ({
//           ...listingMap,
//           [type]: [],
//         }), {}),
//       pagination: ListingTypes.reduce(
//         (listingMap = {}, type) => ({
//           ...listingMap,
//           [type]: {
//             currentCount: 0,
//             pageSize: 30,
//             pageNum: 1,
//           },
//         }), {}),
//       updateListings: (listingType, newListings) => {
//         const currentListings = get().listings;
//         const currentPagination = get().pagination;

//         const updatedListings = (currentListings[listingType] ?? []).concat(newListings)
//         const {
//           currentCount,
//           pageNum,
//         } = currentPagination[listingType]
//         const updatedCurrentCount = (currentCount ?? 0) + (updatedListings.length)
//         const updatePageNum = (pageNum ?? 0) + 1

//         return set({
//           listings: {
//             ...currentListings,
//             [listingType]: updatedListings
//           },
//           pagination: {
//             ...currentPagination,
//             [listingType]: {
//               ...currentPagination[listingType],
//               currentCount: updatedCurrentCount,
//               pageNum: updatePageNum,
//             }
//           }
//         })
//       },
//     }),
//     {
//       name: 'ninetyNine',
//       storage: createJSONStorage(() => sessionStorage),
//       partialize: (state) => ({
//         listings: state.listings,
//         pagination: state.pagination,
//       }),
//     }
//   )
// )

export const useNinetyNineStore = createSelectors(store);
