import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/FilterUserForClient";
import type { Post, Like } from "@prisma/client";

export type ExtendedPost = Post & {
  likes: Like[];
};

export type PostAuthor = {
  username: string;
  id: string;
  profilePicture: string;
};

export type PostWithAuthor = {
  post: ExtendedPost;
  author: PostAuthor;
};


const addUserDataToPosts = async (posts: ExtendedPost[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const EditPostInput = z.object({
  postId: z.string(),
  content: z
    .string()
    .regex(/^(?:[\w\W]*?[a-zA-Z0-9][\w\W]*){1,280}$/)
    .min(1)
    .max(280),
});

const FollowedWithAuthorSchema = z.object({
  followed: z.object({
    id: z.string(),
    followerId: z.string(),
    followingId: z.string(),
  }),
  author: z.object({
    username: z.string(),
    id: z.string(),
    profilePicture: z.string(),
  }),
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          likes: true, // Include the likes relation in the result
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const postsWithUserData = await addUserDataToPosts([post]);
      return postsWithUserData[0];
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
      include: {
        likes: true, // Include the likes relation in the result
      },
    });

    return addUserDataToPosts(posts);
  }),

  getAllPaginated: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        categoryId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: "desc",
        },
        include: {
          likes: true, // Include the likes relation in the result
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(posts);

      return {
        posts: extendedPosts,
        nextCursor
      };

    }),
    infiniteScrollAllPosts: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
      })
    )
    .query(async({ ctx, input }) => {
      const { limit, skip, cursor } = input;
      const items = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'desc',
        },
        include: {
          likes: true, // Include the likes relation in the result
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts:extendedPosts,
        nextCursor,
      };
    }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
          include: {
            likes: true, // Include the likes relation in the result
          },
        })
        .then(addUserDataToPosts)
    ),

    infiniteScrollFollowerUsersPosts: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        followers: z.array(FollowedWithAuthorSchema),
      })
    )
    .query(async({ ctx, input }) => {
      const { limit, skip, cursor } = input;
      const currentUserId = ctx.userId;
      const followers = input.followers;

      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized",
        });
      }
      const authorIds = followers.map((follower) => follower.author.id);

      const items = await ctx.prisma.post.findMany({
        where: {
          authorId: {
            in: authorIds
          },
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          likes: true, // Include the likes relation in the result
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts:extendedPosts,
        nextCursor,
      };
    }),

  getPostsFromFollowedUsers: publicProcedure
    .input(
      z.object({
        followers: z.array(FollowedWithAuthorSchema),
      })
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.userId;
      const followers = input.followers;
      if (!currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized",
        });
      }

      const authorIds = followers.map((follower) => follower.author.id);
      return await ctx.prisma.post
        .findMany({
          where: {
            authorId: {
              in: authorIds,
            },
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
          include: {
            likes: true,
          },
        })
        .then(addUserDataToPosts);
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .regex(/^(?:[\w\W]*?[a-zA-Z0-9][\w\W]*){1,280}$/)
          .min(1)
          .max(280),
      })
    )

    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      console.log(success);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),

  editPost: privateProcedure
    .input(EditPostInput)
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      // Check if the user is the author of the post
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
      });

      if (!post || post.authorId !== authorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to edit this post",
        });
      }

      // Update the post
      const updatedPost = await ctx.prisma.post.update({
        where: { id: input.postId },
        data: { content: input.content, isEdited: true },
      });

      return updatedPost;
    }),

  deletePost: privateProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      // Check if the user is the author of the post
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
      });

      if (!post || post.authorId !== authorId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete this post",
        });
      }

      // Delete the post
      const deletedPost = await ctx.prisma.post.delete({
        where: { id: input.postId },
      });

      return deletedPost;
    }),

  likePost: privateProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const existingLike = await ctx.prisma.like.findFirst({
        where: {
          postId: input.postId,
          authorId: authorId,
        },
      });

      if (existingLike) {
        console.log("existing like found");
        // If the user already liked the post, remove the like
        await ctx.prisma.like.delete({
          where: { id: existingLike.id },
        });
      } else {
        // If the user hasn't liked the post yet, add a new like
        await ctx.prisma.like.create({
          data: {
            postId: input.postId,
            authorId: authorId,
          },
        });
      }

      return { success: true };
    }),
});
