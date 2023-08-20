import { test, expect, afterAll } from "@jest/globals";
import { appRouter } from "../../root";
import { prisma } from "../../../db";

afterAll(async () => {
  // Disconnect Prisma
  await prisma.$disconnect();
});

test("Feed all posts test", async () => {

  const caller = appRouter.createCaller({
    session: null,
    prisma: prisma,
    userId: null,
  });

  const result = await caller.posts.infiniteScrollAllPosts({limit:4});

  expect(result.posts).toHaveLength(4);

  console.log(result);
});
