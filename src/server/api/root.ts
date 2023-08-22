import { createTRPCRouter } from "./trpc";
import { postsRouter } from "./routers/posts";
import { profileRouter } from "./routers/profile";
import { followRouter } from "./routers/followers";
import { clerkRouter } from "./routers/clerk";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile : profileRouter,
  follow : followRouter,
  clerk : clerkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
