import { z } from "zod";

import { NinetyNine } from "@/data/clients/ninetyNine";
import { getPredefinedNeighbourhoods } from "@/data/stores/ninetyNine";

import { createTRPCRouter, publicProcedure } from "../trpc";

const client: NinetyNine = new NinetyNine();

export const ninetyNineRouter = createTRPCRouter({
  getListings: publicProcedure
    .input(
      z.object({
        listingType: z.string().trim().min(1),
        listingCategory: z.string().trim().optional(),
        pageSize: z.number().optional(),
        pageNum: z.number().optional(),
      })
    )
    .query(
      async ({ input }) =>
        await client.getListings(input.listingType, input.listingCategory, {
          pageSize: input.pageSize,
          pageNum: input.pageNum,
        })
    ),

  getCluster: publicProcedure
    .input(
      z.object({
        clusterId: z.string().trim().min(1),
      })
    )
    .query(async ({ input }) => await client.getCluster(input.clusterId)),

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

  // getMRTs: publicProcedure.query(async () => await client.getMRTs()),

  // getPostalInfo: publicProcedure
  //   .input(
  //     z.object({
  //       postalCode: z.number().optional(),
  //     })
  //   )
  //   .query(async ({ input }) => await client.getPostalInfo(input.postalCode)),

  getNeighbourhoods: publicProcedure.query(async ({ ctx }) => {
    const neighbourhoods = getPredefinedNeighbourhoods();
    await Object.entries(neighbourhoods).forEach(async ([name, assetUrl]) => {
      await ctx.prisma.neighbourhood.upsert({
        where: {
          name: name,
        },
        create: {
          name,
          assetUrl,
        },
        update: {
          assetUrl,
        },
      });
    });

    return neighbourhoods;
  }),

  getNeighbourhood: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1),
      })
    )
    .query(async ({ input }) => await client.getNeighbourhood(input.name)),
});
