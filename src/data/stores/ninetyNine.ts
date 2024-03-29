import { Neighbourhood } from "@prisma/client";
import { compress, decompress } from "compress-json";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { getUniqueObjectListwithKeys } from "@/utils";
import { innerApi } from "@/utils/api";
import { logger } from "@/utils/debug";
import { createSelectors, storage } from "@/utils/store";

import {
  Listing,
  ListingType,
  ListingTypes,
  PaginationInfo,
} from "@/types/ninetyNine";

interface State {
  currentListing: Listing | null;
  savedListings: Listing[];
  listings: Map<ListingType, Listing[]>;
  queryListings: Map<ListingType, Listing[]>;
  neighbourhoods: Record<string, Neighbourhood>;
  pagination: Map<ListingType, PaginationInfo>;
}

interface Mutators {
  updateListings: (
    listingType: ListingType,
    newListings: Listing[],
    overwrite?: boolean
  ) => void;
  getMoreListings: (listingType: ListingType) => void;
  getListing: (
    listingType: ListingType,
    listingId: Listing["id"]
  ) => Listing | null;
  updateCurrentListing: (listing: Listing) => void;
  removeListing: (listingType: ListingType, listingId: Listing["id"]) => void;
}

interface Store extends State, Mutators {}

//#endregion  //*======== Universal Functions ===========

const cachedStates: string[] = [
  "currentListing",
  "savedListings",
  "neighbourhoods",
];
export const defaultPaginationInfo: PaginationInfo = {
  currentCount: 0,
  pageSize: 30,
  pageNum: 1,
  hasNext: true,
};
export const defaultLaunchPaginationInfo = {
  itemOffset: 0,
  itemLimit: 30,
  sortType: "launch_date",
};
export const defaultListingMap = new Map<ListingType, Listing[]>(
  ListingTypes.map((type) => [type as ListingType, [] as Listing[]])
);

export const neighbourhoodNames: string[] = [
  "aljunied",
  "ang-mo-kio",
  "bedok",
  "bishan",
  "boon-lay",
  "bugis",
  "bukit-batok",
  "bukit-merah",
  "bukit-panjang",
  "bukit-timah",
  "cbd",
  "changi",
  "chinatown",
  "choa-chu-kang",
  "clarke-quay",
  "clementi",
  // "clifford-pier",
  "geylang",
  "robertson-quay",
  "holland",
  "hougang",
  "jurong-east",
  "jurong-west",
  "kallang",
  "kranji",
  "little-india",
  "macritchie-reservoir",
  "marine-parade",
  "marsiling",
  "newton",
  "novena",
  "orchard",
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

export const getPredefinedNeighbourhoods = (): Record<
  string,
  Neighbourhood
> => {
  const baseUrl = `https://res.cloudinary.com/drcfvdkzm/image/upload/t_Sharpened/v1680363728/neighbourhoods`;
  const zoneIdPreifx = `zo`;

  const neighbourhoods: Record<string, Neighbourhood> =
    neighbourhoodNames.reduce(
      (neighbourhoodMap: Record<string, Neighbourhood>, name) => {
        const neighbourhood: Neighbourhood = {
          name,
          assetUrl: `${baseUrl}/${name}.jpg`,
          zoneId: `${zoneIdPreifx}${name}`,
        };
        neighbourhoodMap[name] = neighbourhood;
        return neighbourhoodMap;
      },
      {}
    );

  return neighbourhoods;
};

export const getStringifiedListing = (listing: Listing) =>
  !listing ? "" : JSON.stringify(compress(listing));

export const parseStringifiedListing = <T>(
  stringifiedListing: string | null
): T => {
  if (!stringifiedListing) return {} as T;
  try {
    const stringifiedSnapshot = decompress(
      JSON.parse(stringifiedListing) ?? {}
    ) as T;
    return stringifiedSnapshot;
  } catch (error) {
    console.error(error);
    return {} as T;
  }
};

const updateListings = (
  listingType: ListingType,
  newListings: Listing[],
  state: Store,
  isQuery?: boolean
): Partial<Store> => {
  //#endregion  //*======== Listings ===========
  const listingsKey: keyof State = isQuery ? "queryListings" : "listings";
  const currentListings = state[listingsKey] ?? defaultListingMap;
  logger("ninetyNine.ts line 148", {
    currentListings,
    listingsKey,
    state,
  });
  const updatedListings: Listing[] = getUniqueObjectListwithKeys(
    (currentListings.get(listingType) ?? []).concat(newListings),
    ["id", "address_name"]
  ).sort(() => 0.5 - Math.random());

  currentListings.set(listingType, updatedListings);
  //#endregion  //*======== Listings ===========

  //#endregion  //*======== Pagination Info ===========
  const currentPagination = state.pagination;
  const { currentCount, pageNum, pageSize } =
    currentPagination.get(listingType) ?? defaultPaginationInfo;
  const updatedCurrentCount = (currentCount ?? 0) + updatedListings.length;
  const updatedPageNum = (pageNum ?? 0) + 1;
  const updatedHasNext = newListings.length >= pageSize;

  const updatedPaginationInfo = {
    pageSize: pageSize,
    currentCount: updatedCurrentCount,
    pageNum: updatedPageNum,
    hasNext: updatedHasNext,
  };

  currentPagination.set(listingType, updatedPaginationInfo);
  //#endregion  //*======== Pagination Info ===========

  const updatedState: Partial<Store> = {
    [listingsKey]: currentListings,
    pagination: currentPagination,
  };
  logger("NinetyNine/updateListings", listingType, {
    isQuery,
    updatedState,
    newListings: newListings.length,
    listingsKey,
  });
  return updatedState;
};

//#endregion  //*======== Universal Functions ===========

const store = create<Store>()(
  persist(
    (set, get) => ({
      currentListing: null,
      savedListings: [],
      neighbourhoods: getPredefinedNeighbourhoods(),
      listings: defaultListingMap,
      queryListings: defaultListingMap,
      pagination: new Map<ListingType, PaginationInfo>(
        ListingTypes.map((type) => [
          type as ListingType,
          defaultPaginationInfo as PaginationInfo,
        ])
      ),
      removeListing: (listingType, listingId) => {
        const currentListings: State["listings"] = get().listings;
        const updateListings: Listing[] = (
          currentListings.get(listingType) ?? []
        ).filter((listing) => listing.id === listingId);
        currentListings.set(listingType, updateListings);

        set((state) => ({
          listings: currentListings ?? state.listings,
        }));
      },
      updateCurrentListing: (listing) =>
        set((state) => ({
          currentListing: listing ?? state.currentListing,
        })),
      updateListings: (listingType, newListings, overwrite = false) =>
        set((state) =>
          updateListings(listingType, newListings, state, overwrite)
        ),
      getMoreListings: async (listingType) => {
        const currentPagination = get().pagination;
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
          logger("ninetyNine.ts line 260", { savedListingIdx });
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
      storage: createJSONStorage(() => storage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => cachedStates.includes(key))
        ),
    }
  )
);

export const useNinetyNineStore = createSelectors(store);
