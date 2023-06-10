//import { type User } from "@clerk/nextjs/dist/types/server";
import type { Follow } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";



export const followRouter = createTRPCRouter({
    
    
  getFollowersById: publicProcedure
  .input(z.object({ followedUserId: z.string().optional() }))
  .query<Follow[]>(async ({ ctx, input }) => {
    // Find all Follow records where the followingId matches the input followedUserId
    const followRecords = await ctx.prisma.follow.findMany({
      where: { followingId: input.followedUserId },
    });

    if (!followRecords || followRecords.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No followers found",
      });
    }

    // Extract the followerId from each Follow record
    //const followerIds = followRecords.map(follower => follower.followerId);

    return followRecords;
  }),




});
