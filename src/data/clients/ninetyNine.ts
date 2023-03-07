import { PaginationInfo } from "@/data/stores";

import { logger } from "@/utils/debug";
import { HTTP } from "@/utils/http";

const Endpoint = `https://www.99.co/api`;

const Routes: Record<string, string> = {
  listings: `/v10/web/search/listings`,
  cluster: `/v1/web/clusters/:clusterId/general`,
  postal: `/v1/web/dashboard/listing-util/address`,
  neighbourhood: `/v1/web/neighbourhoods/:name/places-of-interest`,
  newLaunches: `/v1/web/new-launches/list-all-projects`,
};

export const ListingTypes = ["rent", "sale"];
export type ListingType = (typeof ListingTypes)[number];

export const ListingCategories = ["HDB", "Condo", "Landed"];
export type ListingCategory = (typeof ListingCategories)[number];

export type ListingPhoto = {
  id: string;
  category: string;
  url: string;
};

export type AreaCategory = {
  name: string;
  key: string;
  data: {
    name: string;
    id: string;
    station_options: Record<string, string>[];
  }[];
};

export type Neighbourhood = {
  categories: AreaCategory[];
};

export type ProjectLaunch = {
  development_id: string;
  name: string;
  location: string;
  address_line: string;
  details: string;
  photo_url: string;
  formatted_launch_date: string;
  percentage_sold: number;
  formatted_tags: Record<string, string>[];
  within_distance_from_query: {
    closest_mrt: {
      colors: string[];
      lines: Record<string, string>[];
      title: string;
      walking_time_in_mins: string;
    };
  };
};

export type Listing = {
  id: string;
  listing_type: ListingType;
  photo_url: string;
  address_name: string;
  address_line_2: string;
  main_category: ListingCategory;
  sub_category_formatted: string;
  formatted_tags: Record<string, string>[];
  date_formatted: string;
  attributes: Record<string, string | number>;
  tags: string[];
  cluster_mappings: Record<string, string[]>;
  enquiry_flags: Record<string, boolean>;
  user: Record<string, string>;
  enquiry_options: Record<string, string>[];
  photos: ListingPhoto[];
  location: {
    coordinates: Record<string, number>;
    district: string;
  };
};

export type Cluster = {
  title: string;
  subtitle: string;
  description: string;
  tenure: string;
};

export class NinetyNine {
  private http: HTTP<typeof Routes>;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
  }

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

    try {
      const response = await this.http.get({ url });
      if (!response.ok) return launches;
      const result = await response.json();
      const launchesData: ProjectLaunch[] = (result?.data?.projects ??
        []) as ProjectLaunch[];
      launches.push(...launchesData);
    } catch (error) {
      console.error("NinetyNine/getLaunches", url, error);
    }

    logger("NinetyNine/getLaunches", {
      url: url.toString(),
      launches: launches.length,
      params,
    });
    return launches;
  };

  getListings = async (
    listingType: ListingType = ListingTypes[0],
    listingCategory: ListingCategory = ListingCategories[0],
    extraParams: Record<string, string> = {},
    pagination: Omit<PaginationInfo, "currentCount" | "hasNext"> = {
      pageSize: 30,
      pageNum: 1,
    }
  ) => {
    const listings: Listing[] = [];
    if (!listingType.length) return listings;

    logger("ninetyNine.ts line 185", { listingCategory });
    const params = {
      property_segments: "residential",
      listing_type: listingType,
      main_category: listingCategory,
      rental_type: "unit",
      page_size: pagination.pageSize.toString(),
      page_num: pagination.pageNum.toString(),
      show_cluster_preview: "true",
      show_internal_linking: "true",
      show_meta_description: "true",
      show_description: "true",
      ...extraParams,
    };
    const url = this.http.path("listings", {}, params);

    try {
      const response = await this.http.get({ url });
      if (!response.ok) return listings;
      const result = await response.json();
      const listingsData: Listing[] = (result?.data?.sections?.[0]?.listings ??
        []) as Listing[];
      listings.push(...listingsData);
    } catch (error) {
      console.error("NinetyNine/getListings", url, error);
    }

    logger("NinetyNine/getListings", {
      url: url.toString(),
      listings: listings.length,
      params,
      extraParams,
    });
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

    return this.getListings(
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
    let listing: Listing | null = null;

    const params = {
      property_segments: "residential",
      listing_type: listingType,
      query_type: "cluster",
      query_ids: clusterId,
      show_cluster_preview: "true",
      show_internal_linking: "true",
      show_meta_description: "true",
      show_description: "true",
    };

    const url = this.http.path("listings", {}, params);
    const response = await this.http.get({ url });
    if (!response.ok) return listing;
    const result = await response.json();

    const listingsData: Listing[] = (
      (result?.data?.sections?.[0]?.listings ?? []) as Listing[]
    ).filter(({ id }) => id === listingId);

    listing = listingsData[0] ?? null;
    logger("NinetyNine/getClusterListing/listingsData", listingsData);

    return listing;
  };

  getCluster = async (clusterId: string) => {
    let cluster: Cluster | null = null;
    const url = this.http.path("listings", {
      clusterId,
    });
    const response = await this.http.get({ url });
    if (!response.ok) return cluster;
    const result = await response.json();

    cluster = result?.data ?? null;
    logger("NinetyNine/getCluster", cluster);

    return cluster;
  };

  getNeighbourhood = async (name: string) => {
    let neighbourhood: Neighbourhood | null = null;
    const url = this.http.path("neighbourhood", {
      name,
    });
    const response = await this.http.get({ url });
    if (!response.ok) return neighbourhood;
    const result = await response.json();

    neighbourhood = result?.data ?? null;
    logger("NinetyNine/getNeighbourhood", neighbourhood);

    return neighbourhood;
  };
}
