import { NextPage, NextPageContext } from "next";

import { Layout } from "@/components";
import UnknownState from "@/components/Layouts/UnknownState";

import ErrorClient from "~/assets/images/error-client.svg";
import ErrorServer from "~/assets/images/error-server.svg";

interface Props {
  statusCode?: number;
}

const Error: NextPage<Props> = ({ statusCode }: Props) => {
  const isClient: boolean = !!statusCode ?? true;

  return (
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
        svgNode={isClient ? <ErrorClient /> : <ErrorServer />}
        title={isClient ? `Page not found` : `Something went wrong`}
        subtitle={
          isClient
            ? "Sorry, the page you’re looking for can’t be found"
            : `a server-side error ${statusCode} occurred`
        }
      />
    </Layout.Base>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
