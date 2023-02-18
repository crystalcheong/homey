import { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

import { api } from "@/utils/api";

const IndexPage: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <div>
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
