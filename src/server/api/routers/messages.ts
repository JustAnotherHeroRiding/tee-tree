//import { type User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/nodejs";
import { TRPCError } from "@trpc/server";
import { type Message } from "@prisma/client";
import { type PostAuthor } from "./posts";
import { clerkClient } from "@clerk/nextjs";
import { filterUserForClient } from "~/server/helpers/FilterUserForClient";
import { pusherServerClient } from "~/server/pusher";

export type ExtendedMessage = Message & {
  author?: PostAuthor;
};

export const addUserDataToMessages = async (messages: ExtendedMessage[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: messages.map((message) => message.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return messages.map((message) => {
    const author = users.find((user) => user.id === message.authorId);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      message,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const messagesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const messages = await ctx.prisma.message.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToMessages(messages);
  }),

  getById: publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          OR: [{ authorId: input.authorId }, { recipientId: input.authorId }],
        },
      });

      return addUserDataToMessages(messages);
    }),

  infiniteScrollMessagesWithUserId: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().nullish(),
        skip: z.number().optional(),
        authorId: z.string(),
        recipientId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, skip, cursor, authorId, recipientId } = input;
      const items = await ctx.prisma.message.findMany({
        where: {
          OR: [
            { AND: [{ authorId: authorId }, { recipientId: recipientId }] },
            { AND: [{ authorId: recipientId }, { recipientId: authorId }] },
          ],
        },
        take: limit + 1,
        skip: skip,
        cursor: cursor ? { id: cursor } : undefined,
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }
      const extendedMessages = await addUserDataToMessages(items);
      return {
        messages: extendedMessages,
        nextCursor,
      };
    }),

  deleteMediaMessage: privateProcedure
    .input(z.object({ messageId: z.string(), mediaType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      // Check if the user is the author of the post
      const message = await ctx.prisma.message.findUnique({
        where: { id: input.messageId },
      });

      if (!message || message.authorId !== authorId) {
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
          public_id = message.imageUrl;
          mediaUpdate = { imageUrl: null };
          break;
        case "gif":
          public_id = message.gifUrl;
          mediaUpdate = { gifUrl: null };
          break;
        case "video":
          public_id = message.videoUrl;
          mediaUpdate = { videoUrl: null };
          break;
        default:
          throw new Error("Invalid media type");
      }

      const updatedMessage = await ctx.prisma.message.update({
        where: { id: input.messageId },
        data: {
          ...mediaUpdate,
        },
      });

      return { updatedMessage, public_id }; // include public_id in the return value
    }),

  sendMessage: privateProcedure
    .input(
      z.object({
        senderId: z.string(),
        recipientId: z.string(),
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
      const message = await ctx.prisma.message.create({
        data: {
          authorId: input.senderId,
          recipientId: input.recipientId,
          content: input.content,
        },
      });

      // Trigger a Pusher event
      void pusherServerClient.trigger("messagesUpdates", "new-message", {
        message: message,
      });

      return message;
    }),

  addImageToMessage: privateProcedure
    .input(z.object({ id: z.string(), publicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedMessage = await ctx.prisma.message.update({
        where: { id: input.id },
        data: { imageUrl: input.publicId },
      });

      if (!updatedMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const messageWithUserData = await addUserDataToMessages([updatedMessage]);
      return messageWithUserData[0];
    }),

  addGifToMessage: privateProcedure
    .input(z.object({ id: z.string(), publicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedMessage = await ctx.prisma.message.update({
        where: { id: input.id },
        data: { gifUrl: input.publicId },
      });

      if (!updatedMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      const messageWithUserData = await addUserDataToMessages([updatedMessage]);
      return messageWithUserData[0];
    }),
});
