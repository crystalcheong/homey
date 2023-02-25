import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import { innerApi } from "@/utils/api";
import { logger } from "@/utils/debug";
import { getUniqueObjectList } from "@/utils/helpers";
import { createSelectors } from "@/utils/store";

export type PaginationInfo = {
  currentCount: number;
  pageSize: number;
  pageNum: number;
};

interface State {
  currentListing: Listing | null;
  savedListings: Listing[];
  listings: Map<ListingType, Listing[]>;
  neighbourhoods: Record<string, string>;
  pagination: Map<ListingType, PaginationInfo>;
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

const cachedStates: string[] = ["currentListing", "savedListings"];
export const defaultPaginationInfo: PaginationInfo = {
  currentCount: 0,
  pageSize: 30,
  pageNum: 1,
};

export const getPredefinedNeighbourhoods = (): Record<string, string> => {
  const neighbourhoodNames: string[] = [
    "novena",
    "	orchard",
    "pasir-ris",
    "paya-lebar-airbase",
    "pioneer",
    "punggol",
    "queenstown",
    "river-valley",
    "seletar",
    "sembawang",
    "sengkang",
    "sentosa",
    "serangoon",
    "tampines",
    "tanglin",
    "tanjong-pagar",
    "tiong-bahru",
    "toa-payoh",
    "tuas",
    "woodlands",
    "yishun",
  ];

  const baseUrl = `https://www.99.co/spa-assets/images/neighbourhoods-landing-page/thumb`;

  const neighbourhoods: Record<string, string> = neighbourhoodNames.reduce(
    (neighbourhoodMap: Record<string, string> = {}, name: string) => {
      neighbourhoodMap[name] = `${baseUrl}/${name}.jpg`;
      return neighbourhoodMap;
    },
    {}
  );

  return neighbourhoods;
};

const updateListings = (
  listingType: ListingType,
  newListings: Listing[],
  state: Store
): Partial<Store> => {
  //#endregion  //*======== Listings ===========
  const currentListings = state.listings;
  const updatedListings: Listing[] = getUniqueObjectList(
    (currentListings.get(listingType) ?? []).concat(newListings),
    "id"
  );

  currentListings.set(listingType, updatedListings);
  //#endregion  //*======== Listings ===========

  //#endregion  //*======== Pagination Info ===========
  const currentPagination = state.pagination;
  const { currentCount, pageNum, pageSize } =
    currentPagination.get(listingType) ?? defaultPaginationInfo;
  const updatedCurrentCount = (currentCount ?? 0) + updatedListings.length;
  const updatePageNum = (pageNum ?? 0) + 1;
  const updatedPaginationInfo = {
    pageSize,
    currentCount: updatedCurrentCount,
    pageNum: updatePageNum,
  };

  currentPagination.set(listingType, updatedPaginationInfo);
  //#endregion  //*======== Pagination Info ===========

  const updatedState: Partial<Store> = {
    listings: currentListings,
    pagination: currentPagination,
  };
  logger("NinetyNine/updateListings", listingType, { updatedState });
  return updatedState;
};

//#endregion  //*======== Universal Functions ===========

const store = create<Store>()(
  persist(
    (set, get) => ({
      currentListing: null,
      savedListings: [],
      neighbourhoods: getPredefinedNeighbourhoods(),
      listings: new Map<ListingType, Listing[]>(
        ListingTypes.map((type) => [type as ListingType, [] as Listing[]])
      ),
      pagination: new Map<ListingType, PaginationInfo>(
        ListingTypes.map((type) => [
          type as ListingType,
          {
            currentCount: 0,
            pageSize: 30,
            pageNum: 1,
          } as PaginationInfo,
        ])
      ),
      updateListings: (listingType, newListings) =>
        set((state) => updateListings(listingType, newListings, state)),
      getMoreListings: async (listingType) => {
        // const currentPagination = get().pagination;
        const currentPagination = get().pagination;
        // const { pageNum } = currentPagination[listingType];
        const { pageNum } =
          currentPagination.get(listingType as ListingType) ??
          defaultPaginationInfo;
        const newListings: Listing[] =
          (await innerApi.ninetyNine.getListings.query({
            listingType,
            pageNum,
          })) ?? [];
        return set((state) => updateListings(listingType, newListings, state));
      },
      getListing: (listingType, listingId) => {
        const currentListings: State["listings"] = get().listings;
        const savedListings: State["savedListings"] = get().savedListings;
        const currentListing: State["currentListing"] = get().currentListing;
        const currentTypeListings: Listing[] =
          currentListings.get(listingType) ?? [];

        if (!listingId.length) return null;

        // CHECK: If it matches currentListing
        if (currentListing) {
          const isCurrentListing: boolean = currentListing.id === listingId;
          if (isCurrentListing) return currentListing;
        }
        // CHECK: If it's included in savedListings
        if (savedListings.length) {
          const savedListingIdx: number = savedListings.findIndex(
            ({ id }) => id === listingId
          );
          if (savedListingIdx >= 0) {
            const savedListing: Listing = savedListings[savedListingIdx];
            set((state) => ({
              currentListing: savedListing ?? state.currentListing,
            }));
            return savedListing;
          }
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
