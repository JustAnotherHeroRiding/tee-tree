//import { type User } from "@clerk/nextjs/dist/types/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure, privateProcedure } from "../trpc";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/nodejs";
import { TRPCError } from "@trpc/server";

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

      return message;
    }),

});