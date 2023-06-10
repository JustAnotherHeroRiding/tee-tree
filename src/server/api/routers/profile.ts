import { clerkClient } from "@clerk/nextjs";
//import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/FilterUserForClient";


export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure.input(z.object({ username: z.string() })).
        query(async ({ input }) => {
            const [user] = await clerkClient.users.getUserList({
                username: [input.username],
            });
            if (!user) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "User not found"
                });
            }

            return filterUserForClient(user);
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