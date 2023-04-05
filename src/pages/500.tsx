import { NextPage } from "next";
import dynamic from "next/dynamic";

import { Layout } from "@/components";
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));

import ErrorServer from "~/assets/images/error-server.svg";

const Error500: NextPage = () => (
  <Layout.Base
    showAffix={false}
    layoutStylesOverwrite={{
      display: "flex",
      flexDirection: "column",
      placeContent: "center",
      placeItems: "center",
    }}
  >
    <UnknownState
      svgNode={<ErrorServer />}
      title="Something went wrong"
      subtitle="a server-side error occurred"
    />
  </Layout.Base>
);

export default Error500;
