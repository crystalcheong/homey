import type { NextApiRequest, NextApiResponse } from "next";
import { renderTrpcPanel } from "trpc-panel";

import { env } from "@/env.mjs";

import { appRouter } from "../../server/api/root";

//@see https://github.com/iway1/trpc-panel#nextjs--create-t3-app-example
export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(
    renderTrpcPanel(appRouter, {
      url: `${env.NEXTAUTH_URL}/api/trpc`,
      transformer: "superjson",
    })
  );
}
