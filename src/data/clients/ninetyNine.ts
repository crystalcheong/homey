import { logger } from "@/utils/debug";
import { HTTP } from "@/utils/http";

const Endpoint = `https://www.99.co/api`;

const Routes: Record<string, string> = {
  listings: `/v10/web/search/listings`,
};

export const ListingTypes = ["rent", "sale"];

export type ListingType = (typeof ListingTypes)[number];

export type Listing = {
  id: string;
  listing_type: ListingType;
  photo_url: string;
  address_name: string;
  main_category: string;
  sub_category_formatted: string;
  attributes: Record<string, string | number>;
  tags: string[];
};

export class NinetyNine {
  private http: HTTP<typeof Routes>;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
  }

  getListings = async (
    listingType: ListingType = ListingTypes[0],
    { pageSize = 30, pageNum = 1 }
  ) => {
    const listings: Listing[] = [];
    if (!listingType.length) return listings;

    const params = {
      property_segments: "residential",
      listing_type: listingType,
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
      console.error(
        "NinetyNine/getListings",
        {
          url,
        },
        error
      );
    }

    logger("NinetyNine/getListings", { listings: listings.length, params });
    return listings;
  };
}
