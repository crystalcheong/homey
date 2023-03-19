import { PropertyType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { z } from "zod";

import { logger } from "@/utils/debug";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const accountRouter = createTRPCRouter({
  getAll: publicProcedure.query(
    async ({ ctx }) => await ctx.prisma.user.findMany()
  ),

  getUser: publicProcedure
    .input(
      z.object({
        id: z.string().trim().optional(),
        email: z.string().trim().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.id?.length) {
        return await ctx.prisma.user.findFirst({
          where: {
            id: input.id,
          },
        });
      } else if (input.email?.length) {
        return await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
          },
        });
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable to query without user information",
      });
    }),

  //#endregion  //*======== Auth ===========
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().trim().min(1, "Email address can't be empty"),
        password: z.string().trim().min(1, "Password can't be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exist.",
        });
      }

      if (user.password) {
        const passwordsMatched: boolean = await argon2.verify(
          user.password,
          input.password
        );
        if (!passwordsMatched) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid account credentials.",
          });
        }
      }

      return user;
    }),

  signUp: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Name can't be empty"),
        email: z.string().trim().min(1, "Email address can't be empty"),
        password: z.string().trim().min(1, "Password can't be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });

      if (user) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      const hashedPassword: string = await argon2.hash(input.password);

      return ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });
    }),

  deleteUser: protectedProcedure
    .input(
      z.object({
        id: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exist.",
        });
      }

      return ctx.prisma.user.delete({
        where: {
          id: input.id,
        },
      });
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      //TODO: Update password
      return await ctx.prisma.user.upsert({
        where: {
          id: input.id,
        },
        create: {},
        update: {
          name: input.name,
        },
      });
    }),
  //#endregion  //*======== Auth ===========

  //#endregion  //*======== UserSavedProperty ===========
  unsaveProperty: protectedProcedure
    .input(
      z.object({
        userId: z.string().trim().min(1, "User ID can't be empty"),
        listingId: z.string().trim().min(1, "Listing ID can't be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [, savedProperties] = await ctx.prisma.$transaction([
        ctx.prisma.userSavedProperty.delete({
          where: {
            propertyId_userId: {
              propertyId: input.listingId,
              userId: input.userId,
            },
          },
        }),
        ctx.prisma.userSavedProperty.findMany({
          where: {
            userId: input.userId,
          },
          include: {
            property: true,
          },
        }),
      ]);

      return savedProperties;
    }),

  saveProperty: protectedProcedure
    .input(
      z.object({
        userId: z.string().trim().min(1, "User ID can't be empty"),
        listingId: z.string().trim().min(1, "Listing ID can't be empty"),
        listingType: z.nativeEnum(PropertyType),
        clusterId: z.string().trim().min(1, "Cluster ID can't be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [user, property] = await ctx.prisma.$transaction([
        ctx.prisma.user.findFirst({
          where: {
            id: input.userId,
          },
        }),
        ctx.prisma.property.findFirst({
          where: {
            id: input.listingId,
          },
        }),
      ]);

      logger("account.ts line 133", { user, property });

      if (!property) {
        logger("account.ts line 136", "CREATE Property");
        await ctx.prisma.property.create({
          data: {
            id: input.listingId,
            type: input.listingType,
            clusterId: input.clusterId,
            userSaved: {
              create: {
                userId: input.userId,
              },
            },
          },
        });
      } else {
        logger("account.ts line 150", "UPSERT UserSavedProperty");

        await ctx.prisma.userSavedProperty.upsert({
          where: {
            propertyId_userId: {
              propertyId: input.listingId,
              userId: input.userId,
            },
          },
          create: {
            propertyId: input.listingId,
            userId: input.userId,
          },
          update: {
            propertyId: input.listingId,
            userId: input.userId,
          },
        });
      }

      return await ctx.prisma.userSavedProperty.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          property: true,
        },
      });
    }),

  getUserSaved: publicProcedure
    .input(
      z.object({
        id: z.string().trim().optional(),
        email: z.string().trim().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.id?.length) {
        return await ctx.prisma.userSavedProperty.findMany({
          where: {
            User: {
              id: input.id,
            },
          },
          include: {
            property: true,
          },
        });
      } else if (input.email?.length) {
        return await ctx.prisma.userSavedProperty.findMany({
          where: {
            User: {
              email: input.email,
            },
          },
          include: {
            property: true,
          },
        });
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable to query without user information",
      });
    }),
  //#endregion  //*======== UserSavedProperty ===========

  getUserById: publicProcedure
    .input(
      z.object({
        id: z.string().trim().min(1, "User ID can't be empty"),
      })
    )
    .query(({ input, ctx }) =>
      ctx.prisma.user.findFirst({
        where: {
          id: input.id,
        },
      })
    ),

  getUserByEmail: publicProcedure
    .input(
      z.object({
        email: z.string().trim().min(1, "User ID can't be empty"),
      })
    )
    .query(({ input, ctx }) =>
      ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
        include: {
          propertySaved: {
            include: {
              property: true,
            },
          },
        },
      })
    ),
});
