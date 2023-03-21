import { accountRouter } from "@/server/api/routers/account";
import { accountV2Router } from "@/server/api/routers/accountV2";
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
  accountV2: accountV2Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
