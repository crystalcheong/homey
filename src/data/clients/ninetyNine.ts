import { logger } from "@/utils/debug";
import { HTTP } from "@/utils/http";

const Endpoint = `https://www.99.co/api`;

const Routes: Record<string, string> = {
  listings: `/v10/web/search/listings`,
};

export const ListingTypes = ["rent", "sale"];
export type ListingType = (typeof ListingTypes)[number];

export const ListingCategories = ["HDB", "Condo"];
export type ListingCategory = (typeof ListingCategories)[number];

export type Listing = {
  id: string;
  listing_type: ListingType;
  photo_url: string;
  address_name: string;
  main_category: ListingCategory;
  sub_category_formatted: string;
  attributes: Record<string, string | number>;
  tags: string[];
  cluster_mappings: Record<string, string[]>;
  enquiry_flags: Record<string, boolean>;
  user: Record<string, string>;
  enquiry_options: Record<string, string>[];
};

export class NinetyNine {
  private http: HTTP<typeof Routes>;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
  }

  getListings = async (
    listingType: ListingType = ListingTypes[0],
    listingCategory: ListingCategory = ListingCategories[0],
    { pageSize = 30, pageNum = 1 }
  ) => {
    const listings: Listing[] = [];
    if (!listingType.length) return listings;

    const params = {
      property_segments: "residential",
      listing_type: listingType,
      main_category: listingCategory,
      rental_type: "unit",
      page_size: pageSize.toString(),
      page_num: pageNum.toString(),
      show_cluster_preview: "true",
      show_internal_linking: "true",
      show_meta_description: "true",
      show_description: "true",
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

    logger("NinetyNine/getListings", { listings: listings.length, params });
    return listings;
  };

  getClusterListing = async (
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
}
