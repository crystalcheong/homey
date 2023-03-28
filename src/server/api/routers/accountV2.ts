import { PropertyType, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { z } from "zod";

import { AccountV2 } from "@/data/clients/accountV2";
import { Cloudinary } from "@/data/clients/cloudinary";

import { logger } from "@/utils/debug";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const client: AccountV2 = new AccountV2();
const cloudinary = new Cloudinary();

export const accountV2Router = createTRPCRouter({
  getUser: publicProcedure
    .meta({
      description: "Retrieve user by ID or email",
    })
    .input(
      z.object({
        id: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .default("")
          .optional(),
        email: z
          .string()
          .email("Input must be a valid email address")
          .trim()
          .default("")
          .optional(),
      })
    )
    .query(async ({ input }) => {
      if (input?.id?.length || input?.email?.length) {
        return await client.getUser(input.id, input.email);
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable to query without user information",
      });
    }),

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
    .mutation(async ({ input }) => {
      const user: User | null = (await client.getUser(
        "",
        input.email
      )) as unknown as User;
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User does not exist.",
        });
      }

      if (user?.password) {
        const startsWithDollarSign = (str: string): boolean => /^\$/.test(str);
        const isHashed: boolean = startsWithDollarSign(user.password);

        let passwordsMatched: boolean = user.password === input.password;
        if (isHashed) {
          passwordsMatched = await argon2.verify(user.password, input.password);
        }

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
    .mutation(async ({ input }) => {
      const hashedPassword: string = await argon2.hash(input.password);
      logger("accountV2.ts line 88/signUp", { input, hashedPassword });

      return await client.createUser(input.name, input.email, hashedPassword);
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
    .mutation(async ({ input }) => {
      return await client.deleteUser(input.id);
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
    .mutation(async ({ input }) => {
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
          (await cloudinary.uploadImage(input.image, input.id)) ?? "";

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
      }

      if (input.password.length) {
        const hashedPassword: string = await argon2.hash(input.password);
        updateData.password = hashedPassword;
      }

      logger("account.ts line 195", { input, updateData });

      if (!Object.keys(updateData).length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Unable to update with malformed input",
        });
      }

      return await client.updateUser({
        id: input.id,
        user: updateData,
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
    .mutation(async ({ input }) => {
      const user: User | null = (await client.getUser(
        input.id
      )) as unknown as User;

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
        const startsWithDollarSign = (str: string): boolean => /^\$/.test(str);
        const isHashed: boolean = startsWithDollarSign(user.password);

        let passwordsMatched: boolean = user.password === input.password;
        if (isHashed) {
          passwordsMatched = await argon2.verify(user.password, input.password);
        }

        if (!passwordsMatched) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid account credentials.",
          });
        }
        return true;
      }

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient inputs for authorization confirmation.",
      });
    }),

  saveProperty: protectedProcedure
    .input(
      z.object({
        userId: z
          .string()
          .cuid2("Input must be a valid user ID")
          .trim()
          .min(1, "User ID can't be empty"),
        listingId: z.string().trim().min(1, "Listing ID can't be empty"),
        listingType: z.nativeEnum(PropertyType),
        clusterId: z.string().trim().min(1, "Cluster ID can't be empty"),
        stringifiedListing: z
          .string()
          .trim()
          .min(1, "Stringified Listing can't be empty"),
      })
    )
    .mutation(async ({ input }) => {
      return await client.saveProperty(
        input.userId,
        input.listingId,
        input.listingType,
        input.clusterId
      );
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
    .mutation(async ({ input }) => {
      return await client.unsaveProperty(input.userId, input.listingId);
    }),
});
