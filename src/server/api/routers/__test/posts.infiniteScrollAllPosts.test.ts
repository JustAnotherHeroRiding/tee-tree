import { test, expect, afterAll } from "@jest/globals";
import { appRouter } from "../../root";
import { prisma } from "../../../db";
import {mockDeep} from "jest-mock-extended"
import { type PrismaClient } from "@prisma/client";

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

});


test("Initial Feed Mock test" , async () => {

    const prismaMock = mockDeep<PrismaClient>();

    const mockOutput : [string, number][] = [['#testing', 10]]

    const caller = appRouter.createCaller({
        session: null,
        prisma: prismaMock,
        userId: null,
      });

      const result = await caller.posts.getTrends({limit: 10});

      expect(result).toHaveLength(mockOutput.length)
      expect(result).toStrictEqual(mockOutput)
});
