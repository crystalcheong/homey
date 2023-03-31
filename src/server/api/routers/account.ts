import {
  ListingSource,
  PropertyListing,
  PropertyType,
  SavedPropertyListing,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { z } from "zod";

import { Cloudinary } from "@/data/clients/cloudinary";
import { Gov } from "@/data/clients/gov";
import { Supabase } from "@/data/clients/supabase";

import { logger } from "@/utils/debug";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const cloudinary = new Cloudinary();
const supabase = new Supabase();

export const accountRouter = createTRPCRouter({
  getAll: protectedProcedure
    .meta({
      description: "Retrieve all users",
    })
    .query(async ({ ctx }) => await ctx.prisma.user.findMany()),

  getUser: publicProcedure
    .meta({
      description: "Retrieve user by ID or email",
    })
    .input(
      z.object({
        id: z.string().cuid2("Input must be a valid user ID").trim().optional(),
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .optional(),
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
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .min(1, "Email address can't be empty"),
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

        const hashedPassword: string = await argon2.hash(input.password);

        logger("account.ts line 87", {
          passwordsMatched,
          user,
          input,
          hashedPassword,
        });
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
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .min(1, "Email address can't be empty"),
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

      // CREATE ON SUPABASE
      await supabase.client.auth.signUp({
        email: input.email,
        password: hashedPassword,
      });

      return ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          emailVerified: new Date().toISOString(),
        },
      });
    }),

  signUpAgent: publicProcedure
    .input(
      z.object({
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
        name: z.string().trim().min(1, "Name can't be empty"),
        ceaLicense: z.string().trim().min(1, "CEA License can't be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User doesn't exists.",
        });
      }

      // GOV
      const govClient: Gov = new Gov();
      const isCEALicensed = await govClient.checkIsCEALicensed(
        input.name,
        input.ceaLicense
      );
      if (!isCEALicensed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid CEA License.",
        });
      }

      logger("account.ts line 189", {
        user,
        isCEALicensed,
      });

      const agentUser = await ctx.prisma.propertyAgent.create({
        data: {
          ceaLicense: input.ceaLicense,
          phoneNumber: "",
          userId: input.id,
          isVerified: govClient.isNotValidated,
        },
        include: {
          user: true,
        },
      });

      if (!agentUser) {
        await ctx.prisma.user.delete({
          where: {
            id: input.id,
          },
        });
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Invalid agent registration.",
        });
      }

      return agentUser;
    }),

  deleteUser: protectedProcedure
    .input(
      z.object({
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
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
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
        name: z.string().trim().default(""),
        image: z.string().trim().default(""),
        password: z.string().trim().default(""),
        removeImage: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, string> = {};

      logger("account.ts line 181", {
        input,
      });

      if (input.name.length) {
        updateData.name = input.name;
        logger("account.ts line 195/updateData-name", { input, updateData });
      }

      if (input.image.length) {
        const imageUrl: string =
          (await cloudinary.uploadImage(
            input.image,
            input.id,
            "user-avatar"
          )) ?? "";

        logger("account.ts line 196/updateData-imageUrl", { imageUrl });

        if (imageUrl.length) {
          updateData["image"] = imageUrl;
          logger("account.ts line 195/updateData-image", {
            input,
            updateData,
            imageUrl,
          });
        }
      } else if (input.removeImage) {
        updateData["image"] = "";
        await cloudinary.deleteImage(input.id);
      }

      if (input.password.length) {
        const hashedPassword: string = await argon2.hash(input.password);
        updateData.password = hashedPassword;

        // UPDATE ON SUPABASE
        await supabase.client.auth.updateUser({
          password: updateData.password,
        });
      }

      logger("account.ts line 195", { input, updateData });

      if (!Object.keys(updateData).length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unable to update with malformed input",
        });
      }

      return await ctx.prisma.user.upsert({
        where: {
          id: input.id,
        },
        create: {},
        update: updateData,
      });
    }),

  requestPasswordReset: publicProcedure
    .input(
      z.object({
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .min(1, "Email address can't be empty"),
        redirectTo: z.string().trim().min(1, "Redirection path can't be empty"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email is not associated with an account",
        });
      }

      logger("account.ts line 272/requestPasswordReset", {
        user,
      });
      return await supabase.client.auth.resetPasswordForEmail(input.email, {
        redirectTo: `${input.redirectTo}?id=${user.id}`,
      });
    }),

  updateWithPasswordReset: publicProcedure
    .input(
      z.object({
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
        accessToken: z
          .string()
          .trim()
          .min(500, "A valid access token is required"),
        password: z.string().trim().min(1, "Password can't be empty"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const hashedPassword: string = await argon2.hash(input.password);

      const updateData: Record<string, string> = {
        password: hashedPassword,
      };

      // SUPABASE
      await supabase.client.auth.updateUser(updateData);

      return await ctx.prisma.user.upsert({
        where: {
          id: input.id,
        },
        create: {},
        update: updateData,
      });
    }),

  //#endregion  //*======== Auth ===========

  //#endregion  //*======== UserSavedProperty ===========
  // unsavePropertyV1: protectedProcedure
  //   .input(
  //     z.object({
  //       userId: z
  //         .string()
  //         .cuid2("Input must be a valid user ID")
  //         .trim()
  //         .min(1, "User ID can't be empty"),
  //       listingId: z.string().trim().min(1, "Listing ID can't be empty"),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const [, savedProperties] = await ctx.prisma.$transaction([
  //       ctx.prisma.userSavedProperty.delete({
  //         where: {
  //           propertyId_userId: {
  //             propertyId: input.listingId,
  //             userId: input.userId,
  //           },
  //         },
  //       }),
  //       ctx.prisma.userSavedProperty.findMany({
  //         where: {
  //           userId: input.userId,
  //         },
  //         include: {
  //           property: true,
  //         },
  //       }),
  //     ]);

  //     return savedProperties;
  //   }),

  // savePropertyV1: protectedProcedure
  //   .input(
  //     z.object({
  //       userId: z
  //         .string()
  //         .cuid2("Input must be a valid user ID")
  //         .trim()
  //         .min(1, "User ID can't be empty"),
  //       listingId: z.string().trim().min(1, "Listing ID can't be empty"),
  //       listingType: z.nativeEnum(PropertyType),
  //       clusterId: z.string().trim().min(1, "Cluster ID can't be empty"),
  //       stringifiedListing: z
  //         .string()
  //         .trim()
  //         .min(1, "Stringified Listing can't be empty"),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const [user, property] = await ctx.prisma.$transaction([
  //       ctx.prisma.user.findFirst({
  //         where: {
  //           id: input.userId,
  //         },
  //       }),
  //       ctx.prisma.property.findFirst({
  //         where: {
  //           id: input.listingId,
  //         },
  //       }),
  //     ]);

  //     logger("account.ts line 133", { user, property });

  //     if (!property) {
  //       logger("account.ts line 136", "CREATE Property");
  //       await ctx.prisma.property.create({
  //         data: {
  //           id: input.listingId,
  //           type: input.listingType,
  //           clusterId: input.clusterId,
  //           stringifiedListing: input.stringifiedListing,
  //           userSaved: {
  //             create: {
  //               userId: input.userId,
  //             },
  //           },
  //         },
  //       });
  //     } else {
  //       logger("account.ts line 150", "UPSERT UserSavedProperty");

  //       await ctx.prisma.userSavedProperty.upsert({
  //         where: {
  //           propertyId_userId: {
  //             propertyId: input.listingId,
  //             userId: input.userId,
  //           },
  //         },
  //         create: {
  //           propertyId: input.listingId,
  //           userId: input.userId,
  //         },
  //         update: {
  //           propertyId: input.listingId,
  //           userId: input.userId,
  //         },
  //       });
  //     }

  //     return await ctx.prisma.userSavedProperty.findMany({
  //       where: {
  //         userId: input.userId,
  //       },
  //       include: {
  //         property: true,
  //       },
  //     });
  //   }),

  saveProperty: protectedProcedure
    .input(
      z.object({
        userId: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),

        property: z.object({
          id: z.string(),
          source: z.nativeEnum(ListingSource),
          isAvailable: z.boolean().default(true),
          type: z.nativeEnum(PropertyType),
          category: z.string(),
          photoUrl: z.string().optional(),
          agentId: z.string().optional(),
          href: z.string(),
          stringifiedSnapshot: z
            .string()
            .trim()
            .min(1, "Stringified Listing can't be empty"),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const propertyListingData: PropertyListing = {
        id: input.property.id,
        source: input.property.source,
        isAvailable: input.property.isAvailable,
        type: input.property.type,
        category: input.property.category,
        href: input.property.href,
        photoUrl: input.property.photoUrl ?? null,
        stringifiedSnapshot: input.property.stringifiedSnapshot,
        agentId: input.property.agentId ?? null,
      };

      const savedListingData: SavedPropertyListing = {
        userId: input.userId,
        propertyId: input.property.id,
      };

      const [user, property] = await ctx.prisma.$transaction([
        ctx.prisma.user.findFirst({
          where: {
            id: input.userId,
          },
        }),
        ctx.prisma.propertyListing.findFirst({
          where: {
            id: input.property.id,
          },
        }),
      ]);

      logger("account.ts line 133", { user, property });

      if (!property) {
        await ctx.prisma.propertyListing.create({
          data: {
            ...propertyListingData,
            savedBy: {
              create: {
                userId: savedListingData.userId,
              },
            },
          },
        });
      } else {
        await ctx.prisma.savedPropertyListing.create({
          data: savedListingData,
        });
      }

      return await ctx.prisma.savedPropertyListing.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          property: true,
        },
      });
    }),

  unsaveProperty: protectedProcedure
    .input(
      z.object({
        userId: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
        listingId: z.string().trim().min(1, "Listing ID can't be empty"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [, savedProperties] = await ctx.prisma.$transaction([
        ctx.prisma.savedPropertyListing.delete({
          where: {
            userId_propertyId: {
              userId: input.userId,
              propertyId: input.listingId,
            },
          },
        }),
        ctx.prisma.savedPropertyListing.findMany({
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

  getUserSaved: publicProcedure
    .input(
      z.object({
        userId: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .optional(),
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.userId?.length) {
        return await ctx.prisma.savedPropertyListing.findMany({
          where: {
            userId: input.userId,
          },
          include: {
            property: true,
          },
        });
      } else if (input.email?.length) {
        return await ctx.prisma.savedPropertyListing.findMany({
          where: {
            user: {
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

  // getUserSavedV1: publicProcedure
  //   .input(
  //     z.object({
  //       userId: z.string().cuid2("Input must be a valid user ID").trim().optional(),
  //       email: z
  //         .string()
  //         .email("Input must be a valid email address")
  //         .trim()
  //         .optional(),
  //     })
  //   )
  //   .query(async ({ input, ctx }) => {
  //     if (input.userId?.length) {
  //       return await ctx.prisma.userSavedProperty.findMany({
  //         where: {
  //           User: {
  //             id: input.userId,
  //           },
  //         },
  //         include: {
  //           property: true,
  //         },
  //       });
  //     } else if (input.email?.length) {
  //       return await ctx.prisma.userSavedProperty.findMany({
  //         where: {
  //           User: {
  //             email: input.email,
  //           },
  //         },
  //         include: {
  //           property: true,
  //         },
  //       });
  //     }

  //     throw new TRPCError({
  //       code: "NOT_FOUND",
  //       message: "Unable to query without user information",
  //     });
  //   }),

  //#endregion  //*======== UserSavedProperty ===========

  getUserById: publicProcedure
    .input(
      z.object({
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
      })
    )
    .query(
      async ({ input, ctx }) =>
        await ctx.prisma.user.findFirst({
          where: {
            id: input.id,
          },
        })
    ),

  getUserByEmail: publicProcedure
    .input(
      z.object({
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .min(1, "User ID can't be empty"),
      })
    )
    .query(async ({ input, ctx }) => {
      logger("account.ts line 368", { input });
      return await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
        include: {
          savedListing: {
            include: {
              property: true,
            },
          },
          propertyAgent: true,
        },
      });
    }),

  authorizeChanges: protectedProcedure
    .input(
      z.object({
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
        name: z.string().trim().default(""),
        password: z.string().trim().default(""),
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
          code: "UNAUTHORIZED",
          message: "User does not exist.",
        });
      }

      // OAuth account
      if (!user.password?.length && input.name.length) {
        const nameMatched: boolean = input.name === user.name;

        if (!nameMatched) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid authorization confirmation.",
          });
        }
        return true;
      } else if (user.password?.length && input.password.length) {
        const passwordsMatched: boolean = await argon2.verify(
          user.password,
          input.password
        );
        logger("account.ts line 467", { passwordsMatched });
        if (!passwordsMatched) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid authorization confirmation.",
          });
        }
        return true;
      }

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient inputs for authorization confirmation.",
      });
    }),
});
