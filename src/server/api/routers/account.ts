import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const accountRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  //#endregion  //*======== Account ===========
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
      const exists = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        });
      }

      return ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
        },
      });
    }),

  //#endregion  //*======== Account ===========
});
