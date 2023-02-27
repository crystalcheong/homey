import { Neighbourhood } from "@prisma/client";
import { z } from "zod";

import { NinetyNine } from "@/data/clients/ninetyNine";
import {
  defaultPaginationInfo,
  getPredefinedNeighbourhoods,
} from "@/data/stores/ninetyNine";

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
        await client.getListings(
          input.listingType,
          input.listingCategory,
          {},
          {
            pageNum: input.pageNum ?? defaultPaginationInfo.pageNum,
            pageSize: input.pageSize ?? defaultPaginationInfo.pageSize,
          }
        )
    ),

  getZoneListings: publicProcedure
    .input(
      z.object({
        zoneId: z.string().trim().optional(),
        listingType: z.string().trim().min(1),
        listingCategory: z.string().trim().optional(),
        pageSize: z.number().optional(),
        pageNum: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      if (input.zoneId) {
        return await client.getZoneListings(
          input.zoneId,
          input.listingType,
          input.listingCategory,
          {
            pageNum: input.pageNum ?? defaultPaginationInfo.pageNum,
            pageSize: input.pageSize ?? defaultPaginationInfo.pageSize,
          }
        );
      }

      return await client.getListings(
        input.listingType,
        input.listingCategory,
        {},
        {
          pageNum: input.pageNum ?? defaultPaginationInfo.pageNum,
          pageSize: input.pageSize ?? defaultPaginationInfo.pageSize,
        }
      );
    }),

  getCluster: publicProcedure
    .input(
      z.object({
        clusterId: z.string().trim().min(1),
      })
    )
    .query(async ({ input }) => await client.getCluster(input.clusterId)),

  getClusterListings: publicProcedure
    .input(
      z.object({
        listingType: z.string().trim().min(1),
        listingId: z.string().trim().min(1),
        clusterId: z.string().trim().min(1),
      })
    )
    .query(
      async ({ input }) =>
        await client.getClusterListings(
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
    const neighbourhoods: Record<string, Neighbourhood> =
      getPredefinedNeighbourhoods();
    await Object.entries(neighbourhoods).forEach(
      async ([name, neighbourhood]) => {
        await ctx.prisma.neighbourhood.upsert({
          where: {
            name,
          },
          create: neighbourhood,
          update: {
            assetUrl: neighbourhood.assetUrl,
            zoneId: neighbourhood.zoneId,
          },
        });
      }
    );

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
