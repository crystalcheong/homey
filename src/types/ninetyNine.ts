import { Neighbourhood, PropertyListing } from "@prisma/client";
import { IconType } from "react-icons";
import { FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

import { getStringWithoutAffix } from "@/utils/helpers";

export const ListingTypes = ["rent", "sale"];
export type ListingType = (typeof ListingTypes)[number];

export const ListingCategories = ["HDB", "Condo", "Landed"];
export type ListingCategory = (typeof ListingCategories)[number];

export type ListingPhoto = {
  id: string;
  category: string;
  url: string;
};

export type AreaCategoryData = {
  name: string;
  id: string;
  station_options: Record<string, string>[];
};

export type AreaCategory = {
  name: string;
  key: string;
  data: AreaCategoryData[];
};

export type NeighbourhoodInfo = Neighbourhood & {
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

export interface NinetyNineListing extends PropertyListing {
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
}

export type Listing = NinetyNineListing;

export type Cluster = {
  title: string;
  subtitle: string;
  description: string;
  tenure: string;
};

export type PaginationInfo = {
  currentCount: number;
  pageSize: number;
  pageNum: number;
  hasNext: boolean;
};

export const EnquiryTypes: string[] = ["call", "whatsapp"];
export type EnquiryType = (typeof EnquiryTypes)[number];
export const EnquiryIcons: Record<EnquiryType, IconType> = {
  [EnquiryTypes[0]]: FaPhoneAlt,
  [EnquiryTypes[1]]: FaWhatsapp,
};

export const PriceTypes: string[] = ["/month", ""];
export type PriceType = (typeof PriceTypes)[number];
export const PriceListingTypes: {
  [key in ListingType]: PriceType;
} = ListingTypes.reduce(
  (searchMap = {}, type: string, idx: number) => ({
    ...searchMap,
    [type]: PriceTypes[idx],
  }),
  {}
);

export const ViewModes = ["grid", "list"];
export type ViewMode = (typeof ViewModes)[number];

export const ListingCardOrientations: string[] = ["vertical", "horizontal"];
export type ListingCardOrientation = (typeof ListingCardOrientations)[number];

export const ViewOrientation: Record<ViewMode, ListingCardOrientation> =
  ViewModes.reduce(
    (
      viewOrientationMap: Record<ViewMode, ListingCardOrientation> = {},
      viewMode,
      idx
    ) => {
      viewOrientationMap[viewMode] = ListingCardOrientations[idx];
      return viewOrientationMap;
    },
    {}
  );

//#endregion  //*======== Zones ===========
export const getZoneIds = (locations: string[]) =>
  locations
    .map((location: string) => `zo${location.replace(/-/g, "_")}`)
    .toString();
//#endregion  //*======== Zones ===========

//#endregion  //*======== Neighbourhood ===========
export const getNeigbourhoodListingsHref = (
  zoneId: string,
  type: ListingType
) => {
  const neighbourhoodName: string = getStringWithoutAffix(zoneId ?? "", "zo");

  return neighbourhoodName.length
    ? `/property/${type}?${new URLSearchParams({
        location: JSON.stringify([neighbourhoodName]),
      })}`
    : "";
};
//#endregion  //*======== Neighbourhood ===========
