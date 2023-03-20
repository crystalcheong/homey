import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { z } from "zod";

import { AccountV2 } from "@/data/clients/accountv2";

import { createTRPCRouter, publicProcedure } from "../trpc";

const client: AccountV2 = new AccountV2();

export const accountV2Router = createTRPCRouter({
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
    .query(async ({ input }) => {
      if (input.id?.length) {
        return await client.getUser(input.id);
      } else if (input.email?.length) {
        // return await ctx.prisma.user.findFirst({
        //   where: {
        //     email: input.email,
        //   },
        // });
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Unable to query without user information",
      });
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

      return await client.createUser(input.name, input.email, hashedPassword);
    }),
});
