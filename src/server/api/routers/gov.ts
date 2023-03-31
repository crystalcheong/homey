import { z } from "zod";

import { Gov } from "@/data/clients/gov";

import { createTRPCRouter, publicProcedure } from "../trpc";

const client: Gov = new Gov();

export const govRouter = createTRPCRouter({
  checkIsCEALicensed: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, "Name can't be empty"),
        ceaLicense: z.string().trim().min(1, "CEA License can't be empty"),
      })
    )
    .mutation(
      async ({ input }) =>
        await client.checkIsCEALicensed(input.name, input.ceaLicense)
    ),
});
