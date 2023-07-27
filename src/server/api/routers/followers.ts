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
    })
    ).map(filterUserForClient);


  return followers.map((follower) => {

    const author = users.find((user) => user.id === follower.followerId);

    if (!author || !author.username) throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Author for follower not found."
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
      message: "Author for followed not found."
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
    profileImageUrl: string;
  };
};

export type FollowedWithAuthor = {
  followed: Follow;
  author: {
    username: string;
    id: string;
    profileImageUrl: string;
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

  getFollowingCountByIds: publicProcedure
  .input(z.object({ mentionedUserIds: z.array(z.string()) }))
  .query(async ({ input, ctx }) => {
    const result : {[key: string]: number} = {};
    for (const id of input.mentionedUserIds) {
      const count = await ctx.prisma.follow.count({
        where: { followerId: id },
      });
      result[id] = count;
    }
    return result;
  }),

  getFollowersCountByIds: publicProcedure
  .input(z.object({ mentionedUserIds: z.array(z.string()) }))
  .query(async ({ input, ctx }) => {
    const result : {[key: string]: number} = {};
    for (const id of input.mentionedUserIds) {
      const count = await ctx.prisma.follow.count({
        where: { followingId: id },
      });
      result[id] = count;
    }
    return result;
  }),

  getNotFollowingCurrentUser: publicProcedure
    .query(async ({ ctx }) => {
      const currentUserId = ctx.userId
      if (!currentUserId) {
        return [];
      }
      
      // Get list of followed users
      const followedUsers = await ctx.prisma.follow.findMany({
        where: { followerId: currentUserId },
      });

      // If the user is not following anyone, return all users from Clerk
      if (!followedUsers || followedUsers.length === 0) {
        return await clerkClient.users.getUserList(); 
      }

      // Extract the followed user ids
      const followedUserIds = followedUsers.map(user => user.followingId);
      
      // Fetch all users from Clerk
      const allUsers = await clerkClient.users.getUserList();
      
      // Filter out the followed users
      const usersNotFollowing = allUsers.filter(user => !followedUserIds.includes(user.id));

      return usersNotFollowing.map(filterUserForClient);
    }),




  getFollowingCurrentUser: publicProcedure
  .query<FollowedWithAuthor[]>(async ({ ctx }) => {
    const currentUserId = ctx.userId
    if (!currentUserId) {
    return [];
    }
    const followRecords = await ctx.prisma.follow.findMany({
      where: { followerId: currentUserId },
    });

    if (!followRecords || followRecords.length === 0) {
      return [];
    }

    // Extract the followerId from each Follow record
    //const followerIds = followRecords.map(follower => follower.followerId);

    return addUserDataToFollowing(followRecords);
  }),

});
