//import { type User } from "@clerk/nextjs/dist/types/server";
import { clerkClient } from "@clerk/nextjs";
import type { Follow } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/FilterUserForClient";

const addUserDataToFollowers = async (followers: Follow[]) => {
  const users =
    (await clerkClient.users.getUserList({
      userId: followers.map((follower) => follower.followerId),
      limit: 100,
    })
    ).map(filterUserForClient);


  return followers.map((follower) => {

    const author = users.find((user) => user.id === follower.followerId);

    if (!author || !author.username) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for post not found"
    });

    return {
      follower,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
}


const addUserDataToFollowing = async (following: Follow[]) => {
  const users =
    (await clerkClient.users.getUserList({
      userId: following.map((followed) => followed.followingId),
      limit: 100,
    })
    ).map(filterUserForClient);


  return following.map((followed) => {

    const author = users.find((user) => user.id === followed.followingId);

    if (!author || !author.username) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for post not found"
    });

    return {
      followed,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
}

export type FollowerWithAuthor = {
  follower: Follow;
  author: {
    username: string;
    id: string;
    profilePicture: string;
  };
};

export type FollowedWithAuthor = {
  followed: Follow;
  author: {
    username: string;
    id: string;
    profilePicture: string;
  };
};



export const followRouter = createTRPCRouter({
    
    
  getFollowersById: publicProcedure
  .input(z.object({ followedUserId: z.string().optional() }))
  .query<FollowerWithAuthor[]>(async ({ ctx, input }) => {
    // Find all Follow records where the followingId matches the input followedUserId
    const followRecords = await ctx.prisma.follow.findMany({
      where: { followingId: input.followedUserId },
    });

    if (!followRecords || followRecords.length === 0) {
      return [];
    }

   
    return addUserDataToFollowers(followRecords);
  }),


  getFollowingById: publicProcedure
  .input(z.object({ followingUserId: z.string().optional() }))
  .query<FollowedWithAuthor[]>(async ({ ctx, input }) => {
    // Find all Follow records where the followingId matches the input followedUserId
    const followRecords = await ctx.prisma.follow.findMany({
      where: { followerId: input.followingUserId },
    });

    if (!followRecords || followRecords.length === 0) {
      return [];
    }

    // Extract the followerId from each Follow record
    //const followerIds = followRecords.map(follower => follower.followerId);

    return addUserDataToFollowing(followRecords);
  }),




});
