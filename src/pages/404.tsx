import { NextPage } from "next";
import dynamic from "next/dynamic";

import { Layout } from "@/components";
const UnknownState = dynamic(() => import("@/components/Layouts/UnknownState"));

import ErrorClient from "~/assets/images/error-client.svg";

const Error404: NextPage = () => (
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
      svgNode={<ErrorClient />}
      title="Page not found"
      subtitle="Sorry, the page you’re looking for can’t be found"
    />
  </Layout.Base>
);
export default Error404;
