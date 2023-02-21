import { z } from "zod";

import { NinetyNine } from "@/data/clients/ninetyNine";

import { createTRPCRouter, publicProcedure } from "../trpc";

const client: NinetyNine = new NinetyNine();

export const ninetyNineRouter = createTRPCRouter({
  getListings: publicProcedure
    .input(
      z.object({
        listingType: z.string().trim().min(1),
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

  getClusterListing: publicProcedure
    .input(
      z.object({
        listingType: z.string().trim().min(1),
        listingId: z.string().trim().min(1),
        clusterId: z.string().trim().min(1),
      })
    )
    .query(
      async ({ input }) =>
        await client.getClusterListing(
          input.listingType,
          input.listingId,
          input.clusterId
        )
    ),
});
