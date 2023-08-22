import { appRouter } from "../../root";
import { type PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

describe("retweetPost Endpoint", () => {
  const prismaMock = mockDeep<PrismaClient>();
  const userId = "test-user-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Like a Post", async () => {
    const postId = "test-post-id";
    prismaMock.retweet.findFirst.mockResolvedValue(null);

    const createSpy = jest.spyOn(prismaMock.retweet, "create");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.retweetPost({ postId });

    expect(result).toEqual({ success: true });
    expect(createSpy).toHaveBeenCalledWith({
      data: {
        postId,
        authorId: userId,
      },
    });
  });

  test("Retweet a Reply", async () => {
    const replyId = "test-reply-id";
    prismaMock.retweet.findFirst.mockResolvedValue(null);

    const createSpy = jest.spyOn(prismaMock.retweet, "create");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.retweetPost({ replyId });

    expect(result).toEqual({ success: true });
    expect(createSpy).toHaveBeenCalledWith({
      data: {
        replyId,
        authorId: userId,
      },
    });
  });

  test("UnRetweet a Post", async () => {
    const postId = "test-post-id";
    const existingRetweet = {
      id: "existing-retweet-id",
      authorId: userId,
      postId: postId,
      replyId: null,
    };
    prismaMock.retweet.findFirst.mockResolvedValue(existingRetweet);

    const deleteSpy = jest.spyOn(prismaMock.retweet, "delete");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.retweetPost({ postId });

    expect(result).toEqual({ success: true });
    expect(deleteSpy).toHaveBeenCalledWith({
      where: {
        id: existingRetweet.id,
      },
    });
  });

  test("UnRetweet a Reply", async () => {
    const replyId = "test-reply-id";
    const existingRetweet = {
      id: "existing-like-id",
      authorId: userId,
      postId: null,
      replyId: replyId,
    };
    prismaMock.retweet.findFirst.mockResolvedValue(existingRetweet);

    const deleteSpy = jest.spyOn(prismaMock.retweet, "delete");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.retweetPost({ replyId });

    expect(result).toEqual({ success: true });
    expect(deleteSpy).toHaveBeenCalledWith({
      where: {
        id: existingRetweet.id,
      },
    });
  });

  // You can add more test cases for scenarios like unliking a post or reply
});
