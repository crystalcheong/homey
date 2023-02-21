import { accountRouter } from "@/server/api/routers/account";

import { exampleRouter } from "./routers/example";
import { ninetyNineRouter } from "./routers/ninetyNine";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  ninetyNine: ninetyNineRouter,
  account: accountRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
