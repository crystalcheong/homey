import { z } from "zod";

import { NinetyNine } from "@/data/clients/ninetyNine";

import { createTRPCRouter, publicProcedure } from "../trpc";

const client: NinetyNine = new NinetyNine();

export const ninetyNineRouter = createTRPCRouter({
  getListings: publicProcedure
    .input(
      z.object({
        listingType: z.string(),
        pageSize: z.number().optional(),
        pageNum: z.number().optional(),
      })
    )
    .query(
      async ({ input }) =>
        await client.getListings(input.listingType, {
          pageSize: input.pageSize,
          pageNum: input.pageNum,
        })
    ),
});
