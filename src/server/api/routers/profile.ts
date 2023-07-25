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
            if (score != 0) {
              scoredUsers.push([user, score]);
            }
        });

        if (!scoredUsers.length) {
            return [];
        }

        // Sort and pick the top 3
        scoredUsers.sort((a, b) => b[1] - a[1]); //b[1] and a[1] here are the scores
        const topUserTuples = scoredUsers.slice(0, 3);

        // Map to user objects
        const topUsers = topUserTuples.map(tuple => tuple[0]);

        return topUsers.map(filterUserForClient);
    }),


    infiniteScrollSearchResultsUsers: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        offset: z.number().optional(), // Changing from cursor to offset
        query: z.string(), // Adding the search query input
        selector: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { limit, offset } = input;

      // Fetch all users starting from the cursor
      // You might need to adjust this call depending on your actual data
      const users = await clerkClient.users.getUserList({ limit: limit + 1, offset: offset });

      // Same as before...
      // Calculate scores and create list of tuples (user, score), excluding users with a score of 0
      const scoredUsers: Array<[User, number]> = []; // Assuming UserType is the type of your user objects
      users.forEach((user) => {
          const score =
              similarityScore(input.query, user.firstName ?? "") +
              similarityScore(input.query, user.lastName ?? "") +
              similarityScore(input.query, user.username ?? "");
          if (score != 0) {
            scoredUsers.push([user, score]);
          }
      });

      // Return empty array when there's no matching users
      if (!scoredUsers.length) {
          return [];
      }

      // Check if there are more results
      const hasMore = scoredUsers.length > limit;

      // If there are more results, pop the last one off before sorting and slicing
      if (hasMore) {
          scoredUsers.pop();
      }

      // Sort and pick the top defined by limit
      scoredUsers.sort((a, b) => b[1] - a[1]); // b[1] and a[1] here are the scores
      const topUserTuples = scoredUsers.slice(0, limit);

      // Map to user objects
      const topUsers = topUserTuples.map(tuple => tuple[0]);

      // Now we return not only the users, but also if there are more results and the cursor for the next query
      return {
        users: topUsers.map(filterUserForClient),
        hasMore,
        nextOffset: hasMore ? offset ?? 0 + limit : null,
    }
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
