import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { create } from "zustand";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";

import { AppRouter } from "@/server/api/root";
import { getBaseUrl } from "@/utils/api";
import { logger } from "@/utils/debug";
import { getUniqueObjectList } from "@/utils/helpers";
import { createSelectors } from "@/utils/store";

interface State {
  listings: {
    [key in ListingType]: Listing[];
  };
  pagination: {
    [key in ListingType]: {
      currentCount: number;
      pageSize: number;
      pageNum: number;
    };
  };
  updateListings: (listingType: ListingType, newListings: Listing[]) => void;
  getMoreListings: (listingType: ListingType) => void;
}

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
  state: State
): Partial<State> => {
  const currentListings = state.listings;
  const currentPagination = state.pagination;
  const { currentCount, pageNum } = currentPagination[listingType];

  const updatedListings: Listing[] = getUniqueObjectList(
    (currentListings[listingType] ?? []).concat(newListings),
    "id"
  );
  const updatedCurrentCount = (currentCount ?? 0) + updatedListings.length;
  const updatePageNum = (pageNum ?? 0) + 1;

  const updatedState: Partial<State> = {
    listings: {
      ...currentListings,
      [listingType]: updatedListings,
    },
    pagination: {
      ...currentPagination,
      [listingType]: {
        ...currentPagination[listingType],
        currentCount: updatedCurrentCount,
        pageNum: updatePageNum,
      },
    },
  };
  logger("ninetyNine.ts line 76", { updatedState });
  return updatedState;
};

//#endregion  //*======== Universal Functions ===========

const store = create<State>()((set, get) => ({
  listings: ListingTypes.reduce(
    (listingMap = {}, type) => ({
      ...listingMap,
      [type]: [],
    }),
    {}
  ),
  pagination: ListingTypes.reduce(
    (listingMap = {}, type) => ({
      ...listingMap,
      [type]: {
        currentCount: 0,
        pageSize: 40,
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
}));

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
//             pageSize: 40,
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
