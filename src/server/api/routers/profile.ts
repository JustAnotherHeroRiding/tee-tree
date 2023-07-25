import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
//import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/FilterUserForClient";
import { similarityScore } from "~/server/helpers/similarityScore";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return filterUserForClient(user);
    }),

    get3UsersSearch: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
        const users = await clerkClient.users.getUserList();
        const scoredUsers: Array<[User, number]> = []; // Assuming UserType is the type of your user objects

        users.forEach((user) => {
            const score =
                similarityScore(input.query, user.firstName ?? "") +
                similarityScore(input.query, user.lastName ?? "") +
                similarityScore(input.query, user.username ?? "");

            // Create tuples of user with their score
            scoredUsers.push([user, score]);
        });

        if (!scoredUsers.length) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "No users found.",
            });
        }

        // Sort and pick the top 3
        scoredUsers.sort((a, b) => b[1] - a[1]); //b[1] and a[1] here are the scores
        const topUserTuples = scoredUsers.slice(0, 3);

        // Map to user objects
        const topUsers = topUserTuples.map(tuple => tuple[0]);

        return topUsers.map(filterUserForClient);
    }),


  followUser: privateProcedure
    .input(z.object({ userToFollowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const followerId = ctx.userId;
      const alreadyFollowing = await ctx.prisma.follow.findFirst({
        where: {
          followerId: followerId,
          followingId: input.userToFollowId,
        },
      });

      if (alreadyFollowing) {
        console.log("You are already following this user.");
        // If the user is already followig the user, unfollow them
        await ctx.prisma.follow.delete({
          where: { id: alreadyFollowing.id },
        });
      } else {
        // If the user hasn't liked the post yet, add a new like
        await ctx.prisma.follow.create({
          data: {
            followerId: followerId,
            followingId: input.userToFollowId,
          },
        });
      }

      return { success: true };
    }),
});
