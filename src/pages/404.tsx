import { NextPage } from "next";

import { Layout } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

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
