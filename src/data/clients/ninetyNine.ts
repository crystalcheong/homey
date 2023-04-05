import { ListingSource, PropertyListing, PropertyType } from "@prisma/client";
import { Redis } from "@upstash/redis";
import { Cluster } from "cluster";
import { compress } from "compress-json";

import { env } from "@/env.mjs";
import {
  CachedData,
  createCachedObject,
  getInitialType,
  getTimestampAgeInDays,
} from "@/utils";
import { logger } from "@/utils/debug";
import { HTTP } from "@/utils/http";

import {
  ListingCategories,
  ListingCategory,
  ListingType,
  ListingTypes,
  NeighbourhoodInfo,
  NinetyNineListing,
  PaginationInfo,
  ProjectLaunch,
} from "@/types/ninetyNine";

const Endpoint = `https://www.99.co/api`;

const Routes: Record<string, string> = {
  listings: `/v10/web/search/listings`,
  cluster: `/v1/web/clusters/:clusterId/general`,
  postal: `/v1/web/dashboard/listing-util/address`,
  neighbourhood: `/v1/web/neighbourhoods/:name/places-of-interest`,
  newLaunches: `/v1/web/new-launches/list-all-projects`,
};

export class NinetyNine {
  private http: HTTP<typeof Routes>;
  private redis: Redis;
  private source: ListingSource;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
    this.redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    this.source = ListingSource.ninetyNineCo;
  }

  static convertSourceToListing = (
    sourceListing: NinetyNineListing
  ): PropertyListing =>
    getInitialType<typeof sourceListing, PropertyListing>(
      sourceListing
    ) as PropertyListing;

  static stringifySnapshot = (sourceListing: NinetyNineListing) =>
    !sourceListing ? "" : JSON.stringify(compress(sourceListing));

  static getSourceHref = ({
    cluster_mappings,
    listing_type,
    id,
  }: NinetyNineListing) => {
    const clusterId: string =
      cluster_mappings?.development?.[0] ?? cluster_mappings?.local?.[0] ?? "";
    const listingRelativeLink = `/property/${listing_type}/${id}?clusterId=${clusterId}`;
    return listingRelativeLink;
  };

  parseToCompatibleListing = (
    sourceListing: NinetyNineListing
  ): NinetyNineListing => ({
    ...sourceListing,
    source: this.source,
    type: sourceListing.listing_type as PropertyType,
    category: sourceListing.main_category,
    photoUrl: sourceListing.photo_url,
    isAvailable: true,
    href: NinetyNine.getSourceHref(sourceListing),
  });

  // getPostalInfo = async (postalCode = 0) => {
  //   const postalItems: any[] = [];
  //   const params = {
  //     property_segment: "residential",
  //     query: postalCode.toString(),
  //   };
  //   const url = this.http.path("postal", {}, params);

  //   try {
  //     const response = await this.http.get({ url });
  //     if (!response.ok) return postalItems;
  //     const result = await response.json();
  //     const postalData = result?.data ?? [];
  //     postalItems.push(...postalData);
  //   } catch (error) {
  //     console.error("NinetyNine/getPostalInfo", url, error);
  //   }

  //   logger("NinetyNine/getPostalInfo", { postalItems: postalItems.length });
  //   return postalItems;
  // };

  // getMRTs = async () => {
  //   const mrtList: any[] = [];
  //   const url = new URL(`https://www.99.co/-/v3/all-mrts`);

  //   try {
  //     const response = await this.http.get({ url });
  //     if (!response.ok) return mrtList;
  //     const result = await response.json();
  //     const mrtData = result?.data ?? [];
  //     mrtList.push(...mrtData);
  //   } catch (error) {
  //     console.error("NinetyNine/getMRTs", url, error);
  //   }

  //   logger("NinetyNine/getMRTs", { mrtList: mrtList.length });
  //   return mrtList;
  // };

  getLaunches = async (
    pagination = {
      itemOffset: 0,
      itemLimit: 30,
      sortType: "launch_date",
    }
  ) => {
    const launches: ProjectLaunch[] = [];
    const params = {
      item_offset: pagination.itemOffset.toString(),
      item_limit: pagination.itemLimit.toString(),
      sort_order: "desc",
      sort_type: "launch_date",
    };
    const url = this.http.path("newLaunches", {}, params);
    const isFirstQuery: boolean = pagination.itemOffset === 0;
    const cacheKey = "launches";

    fetchLaunches: try {
      if (isFirstQuery) {
        const cachedLaunchesData: CachedData<ProjectLaunch[]> =
          (await this.redis.get(cacheKey)) as CachedData<ProjectLaunch[]>;

        if (Object.keys(cachedLaunchesData).length) {
          const cacheAgeInDays: number = getTimestampAgeInDays(
            cachedLaunchesData.cachedAt
          );

          // Only utilize cache data if it's less than 3 days old
          if (cacheAgeInDays < 3) {
            const cachedLaunches: ProjectLaunch[] =
              cachedLaunchesData.data ?? [];
            launches.push(...cachedLaunches);
            logger("ninetyNine.ts line 217", {
              isFirstQuery,
              cachedLaunches: cachedLaunches.length,
              cacheAgeInDays,
            });
          }
        }

        if (launches.length) {
          logger("ninetyNine.ts line 188", { usedCached: !!launches.length });
          if (launches.length >= pagination.itemLimit) break fetchLaunches;
        }
      }

      const response = await this.http.get({ url });
      if (!response.ok) return launches;
      const result = await response.json();
      const launchesData: ProjectLaunch[] = (result?.data?.projects ??
        []) as ProjectLaunch[];
      launches.push(...launchesData);

      // Serialize cache
      if (isFirstQuery) {
        const cacheData = createCachedObject(launchesData);
        this.redis.set(cacheKey, cacheData);
      }
      logger("NinetyNine/getLaunches", {
        url: url.toString(),
        launches: launches.length,
        params,
      });
    } catch (error) {
      console.error("NinetyNine/getLaunches", url, error);
    }

    return launches;
  };

  getListings = async ({
    type = ListingTypes[0],
    category = ListingCategories[0],
    pagination = {
      pageSize: 30,
      pageNum: 1,
    },
    ignoreCategory = false,
    extraParams = {},
  }: {
    type: ListingType;
    category?: ListingCategory;
    extraParams?: Record<string, string>;
    pagination: Omit<PaginationInfo, "currentCount" | "hasNext">;
    ignoreCategory?: boolean;
  }) => {
    const listings: NinetyNineListing[] = [];
    if (!type.length) return listings;

    const params: Record<string, string> = {
      property_segments: "residential",
      listing_type: type,
      rental_type: "unit",
      page_size: pagination.pageSize.toString(),
      page_num: pagination.pageNum.toString(),
      show_cluster_preview: "true",
      show_internal_linking: "true",
      show_meta_description: "true",
      show_description: "true",
      ...extraParams,
    };
    if (!ignoreCategory) {
      params["main_category"] = category;
    }

    logger("ninetyNine.ts line 185", {
      category,
      ignoreCategory,
      params,
      extraParams,
    });

    const url = this.http.path("listings", {}, params);
    const isFirstQuery: boolean =
      !Object.keys(extraParams).length && pagination.pageNum === 1;

    fetchListings: try {
      if (isFirstQuery) {
        const cachedListingsData: CachedData<NinetyNineListing[]> =
          (await this.redis.get(type)) as CachedData<NinetyNineListing[]>;

        if (Object.keys(cachedListingsData).length) {
          const cacheAgeInDays: number = getTimestampAgeInDays(
            cachedListingsData.cachedAt
          );

          // Only utilize cache data if it's less than 3 days old
          if (cacheAgeInDays < 3) {
            const cachedListings: NinetyNineListing[] = (
              cachedListingsData.data ?? []
            ).map(this.parseToCompatibleListing);
            listings.push(...cachedListings);
            logger("ninetyNine.ts line 217", {
              isFirstQuery,
              cachedListings: cachedListings.length,
              cacheAgeInDays,
            });
          }
        }

        if (listings.length) {
          logger("ninetyNine.ts line 279", { usedCached: !!listings.length });
          if (listings.length >= pagination.pageSize) break fetchListings;
        }
      }

      const response = await this.http.get({ url });
      if (!response.ok) return listings;
      const result = await response.json();
      const listingsData: NinetyNineListing[] = (
        (result?.data?.sections?.[0]?.listings ?? []) as NinetyNineListing[]
      ).map(this.parseToCompatibleListing);

      logger("ninetyNine.ts line 331", {
        isFirstQuery,
        listingsData: listingsData.length,
      });
      listings.push(...listingsData);

      // Serialize cache
      if (isFirstQuery) {
        const cacheData = createCachedObject(listingsData);
        this.redis.set(type, cacheData);
      }
      logger("NinetyNine/getListingsV1", {
        url: url.toString(),
        listings: listings.length,
        params,
        extraParams,
      });
    } catch (error) {
      console.error("NinetyNine/getListingsV1", url, error);
    }
    return listings;
  };

  getListingsV1 = async (
    listingType: ListingType = ListingTypes[0],
    listingCategory: ListingCategory = ListingCategories[0],
    extraParams: Record<string, string> = {},
    pagination: Omit<PaginationInfo, "currentCount" | "hasNext"> = {
      pageSize: 30,
      pageNum: 1,
    },
    ignoreCategory = false
  ) => {
    const listings: NinetyNineListing[] = [];
    if (!listingType.length) return listings;

    const params: Record<string, string> = {
      property_segments: "residential",
      listing_type: listingType,
      rental_type: "unit",
      page_size: pagination.pageSize.toString(),
      page_num: pagination.pageNum.toString(),
      show_cluster_preview: "true",
      show_internal_linking: "true",
      show_meta_description: "true",
      show_description: "true",
      ...extraParams,
    };
    if (!ignoreCategory) {
      params["main_category"] = listingCategory;
    }

    logger("ninetyNine.ts line 185", {
      listingCategory,
      ignoreCategory,
      params,
      extraParams,
    });

    const url = this.http.path("listings", {}, params);
    const isFirstQuery: boolean =
      !Object.keys(extraParams).length && pagination.pageNum === 1;

    fetchListings: try {
      if (isFirstQuery) {
        const cachedListingsData: CachedData<NinetyNineListing[]> =
          (await this.redis.get(listingType)) as CachedData<
            NinetyNineListing[]
          >;

        if (Object.keys(cachedListingsData).length) {
          const cacheAgeInDays: number = getTimestampAgeInDays(
            cachedListingsData.cachedAt
          );

          // Only utilize cache data if it's less than 3 days old
          if (cacheAgeInDays < 3) {
            const cachedListings: NinetyNineListing[] = (
              cachedListingsData.data ?? []
            ).map(this.parseToCompatibleListing);
            listings.push(...cachedListings);
            logger("ninetyNine.ts line 217", {
              isFirstQuery,
              cachedListings: cachedListings.length,
              cacheAgeInDays,
            });
          }
        }

        if (listings.length) {
          logger("ninetyNine.ts line 279", { usedCached: !!listings.length });
          if (listings.length >= pagination.pageSize) break fetchListings;
        }
      }

      const response = await this.http.get({ url });
      if (!response.ok) return listings;
      const result = await response.json();
      const listingsData: NinetyNineListing[] = (
        (result?.data?.sections?.[0]?.listings ?? []) as NinetyNineListing[]
      ).map(this.parseToCompatibleListing);

      logger("ninetyNine.ts line 331", {
        isFirstQuery,
        listingsData: listingsData.length,
      });
      listings.push(...listingsData);

      // Serialize cache
      if (isFirstQuery) {
        const cacheData = createCachedObject(listingsData);
        this.redis.set(listingType, cacheData);
      }
      logger("NinetyNine/getListingsV1", {
        url: url.toString(),
        listings: listings.length,
        params,
        extraParams,
      });
    } catch (error) {
      console.error("NinetyNine/getListingsV1", url, error);
    }

    return listings;
  };

  getZoneListings = async (
    zoneId: string,
    listingType: ListingType = ListingTypes[0],
    listingCategory: ListingCategory = ListingCategories[0],
    pagination: Omit<PaginationInfo, "currentCount" | "hasNext"> = {
      pageSize: 30,
      pageNum: 1,
    }
  ) => {
    const extraParams = {
      query_ids: zoneId,
      query_type: "zone",
    };

    logger("NinetyNine/getZoneListings", {
      extraParams,
      standardParams: {
        listingCategory,
        pagination,
      },
    });

    return this.getListingsV1(
      listingType,
      listingCategory,
      extraParams,
      pagination
    );
  };

  getClusterListings = async (
    listingType: ListingType = ListingTypes[0],
    listingId: string,
    clusterId: string
  ) => {
    let listing: NinetyNineListing | null = null;

    const extraParams = {
      query_type: "cluster",
      query_ids: clusterId,
    };

    try {
      const listingsData: NinetyNineListing[] = await this.getListingsV1(
        listingType,
        undefined,
        extraParams,
        undefined,
        true
      );

      const matchedListings: NinetyNineListing[] = listingsData.filter(
        ({ id }) => id === listingId
      );
      listing = matchedListings?.[0] ?? null;

      logger("ninetyNine.ts line 342", {
        listingsData: listingsData.length,
        matchedListings: matchedListings.length,
        listing,
      });
    } catch (error) {
      console.error("NinetyNine/getClusterListing", error);
    }

    logger("ninetyNine.ts line 351", { listing });
    return listing;
  };

  getCluster = async (clusterId: string): Promise<Cluster | null> => {
    let cluster: Cluster | null = null;
    if (clusterId.length < 3) return cluster;

    const url = this.http.path("cluster", {
      clusterId,
    });
    const response = await this.http.get({ url });
    if (!response.ok) return cluster;
    const result = await response.json();

    cluster = result?.data ?? null;
    logger("NinetyNine/getCluster", cluster);

    return cluster;
  };

  getNeighbourhood = async (
    name: string
  ): Promise<NeighbourhoodInfo | null> => {
    let neighbourhood: NeighbourhoodInfo | null = null;
    const url = this.http.path("neighbourhood", {
      name,
    });

    try {
      const response = await this.http.get({ url });
      if (!response.ok) return neighbourhood;
      const result = await response.json();

      neighbourhood = result?.data ?? null;
      logger("NinetyNine/getNeighbourhood", neighbourhood);
    } catch (error) {
      console.error("NinetyNine/getNeighbourhood", url, error);
    }

    return neighbourhood;
  };
}
