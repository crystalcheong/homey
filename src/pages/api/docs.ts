import type { NextApiRequest, NextApiResponse } from "next";
import { renderTrpcPanel } from "trpc-panel";

import { getBaseUrl } from "@/utils/api";

import { appRouter } from "../../server/api/root";

//@see https://github.com/iway1/trpc-panel#nextjs--create-t3-app-example
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(
    renderTrpcPanel(appRouter, {
      url: `${getBaseUrl()}/api/trpc`,
      transformer: "superjson",
    })
  );
}
