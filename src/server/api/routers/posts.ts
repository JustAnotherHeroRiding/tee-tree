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
import type { Post, Like, Retweet, Reply } from "@prisma/client";
import { env } from "~/env.mjs";
import crypto from "crypto";
import { countHashtags } from "~/server/helpers/countHashtags";

export type ExtendedPost = Post & {
  likes: Like[];
  retweets: Retweet[];
  replies: Reply[];
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

// Function to generate the signature
function generateSignature(publicId: string, apiSecret: string) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

  return crypto.createHash("sha1").update(stringToSign).digest("hex");
}

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

type ResponseData = {
  result: string;
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
    profileImageUrl: z.string(),
  }),
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
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
        likes: true,
        retweets: true, // Include the likes relation in the result
        replies: true,
      },
    });

    return addUserDataToPosts(posts);
  }),

  getAllLastWeek: publicProcedure.query(async ({ ctx }) => {
    // Get the date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Query the posts
    const posts = await ctx.prisma.post.findMany({
      orderBy: [{ createdAt: "desc" }],
      where: {
        // Only consider posts where createdAt is greater than or equal to one week ago
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      include: {
        likes: true,
        retweets: true, // Include the likes relation in the result
        replies: true,
      },
    });

    return addUserDataToPosts(posts);
  }),

  getTrends: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit;
      // Get the date for one week ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Query the posts
      const posts = await ctx.prisma.post.findMany({
        orderBy: [{ createdAt: "desc" }],
        where: {
          createdAt: {
            gte: oneWeekAgo,
          },
        },
      });

      // Count the hashtags
      const hashtagCounts = countHashtags(posts);
      const sortedHashtagCounts = Object.entries(hashtagCounts).sort(
        (a, b) => b[1] - a[1]
      );

      const topHashtags = limit
        ? sortedHashtagCounts.slice(0, limit)
        : sortedHashtagCounts;

      return topHashtags;
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
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
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
        nextCursor,
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
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;
      const items = await ctx.prisma.post.findMany({
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts: extendedPosts,
        nextCursor,
      };
    }),

  infiniteScrollSearchResults: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        query: z.string(), // Adding the search query input
        selector: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;

      const items = await ctx.prisma.post.findMany({
        where: {
          content: {
            contains: input.query,
          },
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy:
          input.selector === "top"
            ? {
                likes: {
                  _count: "desc",
                },
              }
            : {
                createdAt: "desc",
              },
        include: {
          likes: true,
          retweets: true,
          replies: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts: extendedPosts,
        nextCursor,
      };
    }),

  infiniteScrollSearchResultsImages: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        query: z.string(),
        selector: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;

      const items = await ctx.prisma.post.findMany({
        where: {
          content: {
            contains: input.query,
          },
          imageUrl: {
            not: null,
          },
          AND: {
            imageUrl: {
              not: "",
            },
          },
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy:
          input.selector === "top"
            ? {
                likes: {
                  _count: "desc",
                },
              }
            : {
                createdAt: "desc",
              },
        include: {
          likes: true,
          retweets: true,
          replies: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts: extendedPosts,
        nextCursor,
      };
    }),

  infiniteScrollSearchResultsGifs: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        query: z.string(),
        selector: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;

      const items = await ctx.prisma.post.findMany({
        where: {
          content: {
            contains: input.query,
          },
          gifUrl: {
            not: null,
          },
          AND: {
            gifUrl: {
              not: "",
            },
          },
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy:
          input.selector === "top"
            ? {
                likes: {
                  _count: "desc",
                },
              }
            : {
                createdAt: "desc",
              },
        include: {
          likes: true,
          retweets: true,
          replies: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts: extendedPosts,
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
            likes: true,
            retweets: true, // Include the likes relation in the result
            replies: true,
          },
        })
        .then(addUserDataToPosts)
    ),

  getPostsCountByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post.count({
        where: {
          authorId: input.userId,
        },
      })
    ),

  infiniteScrollPostsByUserId: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;
      const items = await ctx.prisma.post.findMany({
        where: {
          OR: [
            { authorId: input.userId },
            {
              retweets: {
                some: {
                  authorId: input.userId,
                },
              },
            },
          ],
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts: extendedPosts,
        nextCursor,
      };
    }),

  infiniteScrollPostsByUserIdLiked: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        // cursor is a reference to the last item in the previous batch
        // it's used to fetch the next batch
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor } = input;
      const items = await ctx.prisma.post.findMany({
        where: {
          likes: {
            some: {
              authorId: input.userId, // Check if the current user's ID is in the likes array
            },
          },
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }
      const extendedPosts = await addUserDataToPosts(items);
      return {
        posts: extendedPosts,
        nextCursor,
      };
    }),

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
    .query(async ({ ctx, input }) => {
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
          OR: [
            {
              authorId: {
                in: authorIds,
              },
            },
            {
              retweets: {
                some: {
                  authorId: {
                    in: authorIds,
                  },
                },
              },
            },
          ],
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          likes: true,
          retweets: {
            include: {
              post: true, // Include the author of each Retweet object
            },
          },
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      // Create a Set of posts, automatically removing duplicates
      const uniquePosts = [
        ...new Set(items.map((item) => JSON.stringify(item))),
      ];

      // Map back to original format
      const posts = uniquePosts.map((post) => JSON.parse(post) as ExtendedPost);

      const extendedPosts = await addUserDataToPosts(posts);
      return {
        posts: extendedPosts,
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
            retweets: true,
            replies: true,
          },
        })
        .then(addUserDataToPosts);
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .regex(
            /^(?:[\s\S]*?[a-zA-Z0-9\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{23F3}\u{24C2}\u{23E9}-\u{23EF}\u{25AA}-\u{25AB}\u{23FA}\u{21AA}\u{21A9}\u{231A}-\u{231B}\u{23F0}\u{23F1}\u{23F2}\u{23F3}\u{23F8}-\u{23FA}][\s\S]*){1,280}$/u
          )
          .min(1)
          .max(280),
      })
    )

    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      // Now use the 'public_id' in your Prisma create call as the 'imageUrl'
      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),

  addImageToPost: privateProcedure
    .input(z.object({ id: z.string(), publicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedPost = await ctx.prisma.post.update({
        where: { id: input.id },
        data: { imageUrl: input.publicId },
        include: {
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
        },
      });

      if (!updatedPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const postsWithUserData = await addUserDataToPosts([updatedPost]);
      return postsWithUserData[0];
    }),

  addGifToPost: privateProcedure
    .input(z.object({ id: z.string(), publicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedPost = await ctx.prisma.post.update({
        where: { id: input.id },
        data: { gifUrl: input.publicId },
        include: {
          likes: true,
          retweets: true, // Include the likes relation in the result
          replies: true,
        },
      });

      if (!updatedPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const postsWithUserData = await addUserDataToPosts([updatedPost]);
      return postsWithUserData[0];
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

  deleteMediaPost: privateProcedure
    .input(z.object({ postId: z.string(), mediaType: z.string() }))
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

      // ...existing code...

      let mediaUpdate = {};
      let public_id = null;

      switch (input.mediaType) {
        case "image":
          public_id = post.imageUrl;
          mediaUpdate = { imageUrl: null };
          break;
        case "gif":
          public_id = post.gifUrl;
          mediaUpdate = { gifUrl: null };
          break;
        case "video":
          public_id = post.videoUrl;
          mediaUpdate = { videoUrl: null };
          break;
        default:
          throw new Error("Invalid media type");
      }

      const updatedPost = await ctx.prisma.post.update({
        where: { id: input.postId },
        data: {
          ...mediaUpdate,
          isEdited: true,
        },
      });

      return { updatedPost, public_id }; // include public_id in the return value
    }),

  deleteMediaCloudinary: privateProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ input }) => {
      const deleteImageUrl = `https://api.cloudinary.com/v1_1/de5zmknvp/image/destroy`;
      const publicId = input.publicId;
      const timestamp = Math.round(new Date().getTime() / 1000);
      const apiKey = env.CLOUDINARY_API_KEY;
      const apiSecret = env.CLOUDINARY_API_SECRET;
      const signature = generateSignature(publicId, apiSecret);

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("signature", signature);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());

      const response = await fetch(deleteImageUrl, {
        method: "POST",
        body: formData,
      });

      const data: ResponseData = (await response.json()) as ResponseData;
      console.log(data);

      if (!data) throw new Error("Failed to delete image from Cloudinary");

      if (data.result === "ok") {
        return { message: "Image deleted from Cloudinary" };
      } else {
        throw new Error("Failed to delete image from Cloudinary");
      }
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
  retweetPost: privateProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const existingRetweet = await ctx.prisma.retweet.findFirst({
        where: {
          postId: input.postId,
          authorId: authorId,
        },
      });

      if (existingRetweet) {
        console.log("existing like found");
        // If the user already liked the post, remove the like
        await ctx.prisma.retweet.delete({
          where: { id: existingRetweet.id },
        });
      } else {
        // If the user hasn't liked the post yet, add a new like
        await ctx.prisma.retweet.create({
          data: {
            postId: input.postId,
            authorId: authorId,
          },
        });
      }

      return { success: true };
    }),
});
