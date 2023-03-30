import { accountRouter } from "@/server/api/routers/account";
import { govRouter } from "@/server/api/routers/gov";
import { ninetyNineRouter } from "@/server/api/routers/ninetyNine";

import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  ninetyNine: ninetyNineRouter,
  account: accountRouter,
  gov: govRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
