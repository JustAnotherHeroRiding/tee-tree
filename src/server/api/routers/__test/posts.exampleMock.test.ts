import { test, expect } from "@jest/globals";
import { appRouter } from "../../root";
import type { Post, PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

test("getOne Mock test", async () => {
  const prismaMock = mockDeep<PrismaClient>();

  const mockOutput: Post = {
    id: "testId",
    createdAt: new Date(),
    content: 'post text',
    imageUrl: null,
    gifUrl: null,
    videoUrl: null,
    authorId: 'authorId',
    isEdited: false,
    dataType: 'post'
  };

  prismaMock.post.findFirst.mockResolvedValue(mockOutput);

  const caller = appRouter.createCaller({
    session: null,
    prisma: prismaMock,
    userId: null,
  });

  const result = await caller.posts.getOneExample();

  expect(result).toStrictEqual(mockOutput);
});
