import { signOut } from "next-auth/react";
import { IconType } from "react-icons";
import {
  TbBookmarks,
  TbBuildingSkyscraper,
  TbBuildingWarehouse,
  TbLogout,
  TbSettings,
} from "react-icons/tb";

import { ListingTypes } from "@/types/ninetyNine";

export interface Route {
  label: string;
  href: string;
  icon?: IconType;
  description?: string;
}

export const AccountMenulist: (Omit<Route, "href"> & {
  href?: string;
  onClick?: () => void;
})[] = [
  {
    label: "Saved listings",
    icon: TbBookmarks,
    href: `/account/saved`,
  },
  {
    label: "Account settings",
    icon: TbSettings,
    href: `/account/update`,
  },
  {
    label: "Logout",
    icon: TbLogout,
    onClick: () => signOut(),
  },
];

export const NavRoutes: (Route & {
  nodes?: Route[];
})[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Rent",
    href: `/property/${ListingTypes[0]}`,
  },
  {
    label: "Buy",
    href: `/property/${ListingTypes[1]}`,
  },
  {
    label: "Explore",
    href: `#`,
    nodes: [
      {
        icon: TbBuildingWarehouse,
        label: "Neighbourhoods",
        href: "/explore/neighbourhoods",
        description: "Find a neighbourhood you'll love to live in",
      },
      {
        icon: TbBuildingSkyscraper,
        label: "New Launches",
        href: "/explore/new-launches",
        description: "Check out the latest projects launches to hit the market",
      },
    ],
  },
];
