import {
  PropertyAgent,
  PropertyListing,
  SavedPropertyListing,
  User,
} from "@prisma/client";
import { ClientSafeProvider } from "next-auth/react";
import { IconType } from "react-icons";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { HiHomeModern } from "react-icons/hi2";
import { MdApartment, MdOutlineRealEstateAgent } from "react-icons/md";

import { neighbourhoodNames } from "@/data/stores";

import { isCEALicense, isEmail, isName, toTitleCase } from "@/utils";

import {
  ListingCategories,
  ListingCategory,
  ListingType,
  ListingTypes,
} from "@/types/ninetyNine";

export const AuthTypes: string[] = ["signIn", "signUp"];
export type AuthType = (typeof AuthTypes)[number];

export const ProviderIcons: {
  [key in ClientSafeProvider["name"]]: IconType;
} = {
  Google: FaGoogle,
  GitHub: FaGithub,
};

export interface PasswordFormState {
  password: string;
  confirmPassword: string;
}

export interface SavedListing extends SavedPropertyListing {
  property: PropertyListing;
}

export type UserAccount = User & {
  propertyAgent?: PropertyAgent[];
};

//#endregion  //*======== AuthForm ===========

export const InitalFormState: Record<string, string> = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  ceaLicense: "",
};

export const FormErrorMessages: {
  [key in keyof typeof InitalFormState]: string;
} = {
  name: "Invalid Name",
  email: "Invalid Email",
  password: "Invalid Password",
  confirmPassword: "Passwords do not match",
  ceaLicense: "Invalid CEA License",
};

export const getEmailSuggestions = (input: string) =>
  input.trim().length > 0 && !input.includes("@")
    ? ["gmail.com", "outlook.com", "yahoo.com"].map(
        (provider) => `${input}@${provider}`
      )
    : [];

export const validateAuthInput = (id: string, value: string, refVal = "") => {
  const validations: {
    [key in keyof typeof InitalFormState]: (
      val: string,
      refVal?: string
    ) => boolean;
  } = {
    email: (val: string) => isEmail(val),
    password: (val: string) => {
      const isValid = !!val.length;
      return isValid;
    },
    confirmPassword: (val: string, ref: string = refVal) => {
      const isValid = !!val.length && ref === val;
      return isValid;
    },
    name: (val: string) => isName(val),
    image: (val: string) => !!val.length,
    ceaLicense: (val: string) => isCEALicense(val),
  };
  return validations[id](value);
};

//#endregion  //*======== AuthForm ===========

//#endregion  //*======== Search Filters ===========
export const SearchTypes: string[] = ["rent", "buy"];
export type SearchType = (typeof SearchTypes)[number];
export const SearchListingTypes: {
  [key in SearchType]: ListingType;
} = SearchTypes.reduce(
  (searchMap = {}, type: string, idx: number) => ({
    ...searchMap,
    [type]: ListingTypes[idx],
  }),
  {}
);

export const LocationSelection = neighbourhoodNames.map((name) => ({
  label: toTitleCase(name.replace(/-/g, " ")),
  value: name,
}));

export const ListingCategoryIcons: {
  [key in ListingCategory]: IconType;
} = {
  [ListingCategories[0]]: MdOutlineRealEstateAgent,
  [ListingCategories[1]]: MdApartment,
  [ListingCategories[2]]: HiHomeModern,
};

export const FilterFormState: {
  location: string[];
  category: ListingCategory;
} = {
  location: [],
  category: "",
};
//#endregion  //*======== Search Filters ===========
