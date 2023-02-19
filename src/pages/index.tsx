import { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

import { Listing, ListingType, ListingTypes } from "@/data/clients/ninetyNine";
import { useNinetyNineStore } from "@/data/stores/ninetyNine";

import { api } from "@/utils/api";

const IndexPage: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const listingType: ListingType = ListingTypes[0];
  const listings: Listing[] = useNinetyNineStore.use.listings()[listingType];
  const updateListings = useNinetyNineStore.use.updateListings();
  const getMoreListings = useNinetyNineStore.use.getMoreListings();

  const { isFetching } = api.ninetyNine.getListings.useQuery(
    {
      listingType,
    },
    {
      enabled: !listings.length,
      onSuccess(data) {
        updateListings(listingType, data as Listing[]);
      },
    }
  );

  const isLoading: boolean = isFetching;
  return (
    <div>
      {!isLoading && (
        <main>
          <p>Listings: {listings.length}</p>
          <button onClick={() => getMoreListings(listingType)}>Get More</button>
        </main>
      )}
      <p>{hello.data ? hello.data.greeting : "Loading tRPC query..."}</p>
      <AuthShowcase />
    </div>
  );
};

export default IndexPage;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div>
      <p>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
