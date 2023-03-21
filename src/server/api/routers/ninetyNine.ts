import { Neighbourhood } from "@prisma/client";
import { z } from "zod";

import {
  Listing,
  ListingCategories,
  ListingTypes,
  NinetyNine,
} from "@/data/clients/ninetyNine";
import {
  defaultLaunchPaginationInfo,
  defaultPaginationInfo,
  getPredefinedNeighbourhoods,
  parseStringifiedListing,
} from "@/data/stores/ninetyNine";

import { logger } from "@/utils/debug";

import { createTRPCRouter, publicProcedure } from "../trpc";

const client: NinetyNine = new NinetyNine();

export const ninetyNineRouter = createTRPCRouter({
  getListings: publicProcedure
    .meta({
      description: "Retrieves listings",
    })
    .input(
      z.object({
        listingType: z.string().trim().min(1).describe(ListingTypes.toString()),
        listingCategory: z
          .string()
          .trim()
          .optional()
          .describe(ListingCategories.toString()),
        pageSize: z
          .number()
          .optional()
          .describe(`${defaultPaginationInfo.pageNum.toString()} (default)`),
        pageNum: z
          .number()
          .optional()
          .describe(`${defaultPaginationInfo.pageSize.toString()} (default)`),
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

  getLaunches: publicProcedure
    .meta({
      description: "Retrieves new condomium project launches",
    })
    .input(
      z.object({
        itemOffset: z
          .number()
          .optional()
          .describe(
            `${defaultLaunchPaginationInfo.itemOffset.toString()} (default)`
          ),
        itemLimit: z
          .number()
          .optional()
          .describe(
            `${defaultLaunchPaginationInfo.itemLimit.toString()} (default)`
          ),
        sortType: z
          .string()
          .optional()
          .describe(
            `${defaultLaunchPaginationInfo.sortType.toString()} (default)`
          ),
      })
    )
    .query(
      async ({ input }) =>
        await client.getLaunches({
          itemLimit: input.itemLimit ?? defaultLaunchPaginationInfo.itemLimit,
          itemOffset:
            input.itemOffset ?? defaultLaunchPaginationInfo.itemOffset,
          sortType: input.sortType ?? defaultLaunchPaginationInfo.sortType,
        })
    ),

  getZoneListings: publicProcedure
    .meta({
      description: "Retrieves listings by zone ID",
    })
    .input(
      z.object({
        zoneId: z.string().trim().optional(),
        listingType: z.string().trim().min(1).describe(ListingTypes.toString()),
        listingCategory: z
          .string()
          .trim()
          .optional()
          .describe(ListingCategories.toString()),
        pageSize: z
          .number()
          .optional()
          .describe(`${defaultPaginationInfo.pageNum.toString()} (default)`),
        pageNum: z
          .number()
          .optional()
          .describe(`${defaultPaginationInfo.pageSize.toString()} (default)`),
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
    .meta({
      description: "Retrieves zone cluster information",
    })
    .input(
      z.object({
        clusterId: z
          .string()
          .trim()
          .min(1)
          .describe(
            'unique cluster identifier, i.e, "deMewPBNuxwKQkPYJreNSyda"'
          ),
      })
    )
    .query(async ({ input }) => await client.getCluster(input.clusterId)),

  getClusterListings: publicProcedure
    .meta({
      description: "Retrieves listings by cluster ID",
    })
    .input(
      z.object({
        listingType: z.string().trim().min(1).describe(ListingTypes.toString()),
        listingId: z
          .string()
          .trim()
          .min(1)
          .describe('unique listing identifier, i.e, "CoPyqumcNnd5Jynmd6soDY"'),
        clusterId: z
          .string()
          .trim()
          .min(1)
          .describe(
            'unique cluster identifier, i.e, "deMewPBNuxwKQkPYJreNSyda"'
          ),
      })
    )
    .query(async ({ input, ctx }) => {
      // Retrieve Property from db
      const property = await ctx.prisma.property.findFirst({
        where: {
          id: input.listingId,
          clusterId: input.clusterId,
        },
      });

      logger("ninetyNine.ts line 180/getClusterListings", { input, property });

      const listing: Listing | null = await client.getClusterListings(
        input.listingType,
        input.listingId,
        input.clusterId
      );

      if (!property) {
        return listing;
      }

      // Update Property availablity on demand
      const isAvailable = !!listing;
      if (isAvailable !== property.isAvailable) {
        property.isAvailable = isAvailable;
        await ctx.prisma.property.update({
          where: {
            id_clusterId: {
              id: property.id,
              clusterId: property.clusterId,
            },
          },
          data: property,
        });
      }

      // Parse stringified to Listing
      const propertyListing: Listing = parseStringifiedListing(
        property.stringifiedListing
      ) as Listing;
      return propertyListing;
    }),

  // getMRTs: publicProcedure.query(async () => await client.getMRTs()),

  // getPostalInfo: publicProcedure
  //   .input(
  //     z.object({
  //       postalCode: z.number().optional(),
  //     })
  //   )
  //   .query(async ({ input }) => await client.getPostalInfo(input.postalCode)),

  getNeighbourhoods: publicProcedure
    .meta({
      description: "Retrieves neighbourhood assetUrl and associated zone ID",
    })
    .query(async ({ ctx }) => {
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
    .meta({
      description: "Retrieves neighbourhood metadata",
    })
    .input(
      z.object({
        name: z
          .string()
          .trim()
          .min(1)
          .describe(
            `neighbourhood name delimited by hyphens, i.e, 'ang-mo-kio', 'aljunied'`
          ),
      })
    )
    .query(async ({ input }) => await client.getNeighbourhood(input.name)),
});
