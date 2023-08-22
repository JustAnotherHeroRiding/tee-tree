import { appRouter } from "../../root";
import { type PrismaClient } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";

describe("likePost Endpoint", () => {
  const prismaMock = mockDeep<PrismaClient>();
  const userId = "test-user-id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Like a Post", async () => {
    const postId = "test-post-id";
    prismaMock.like.findFirst.mockResolvedValue(null);

    const createSpy = jest.spyOn(prismaMock.like, "create");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.likePost({ postId });

    expect(result).toEqual({ success: true });
    expect(createSpy).toHaveBeenCalledWith({
      data: {
        postId,
        authorId: userId,
      },
    });
  });

  test("Like a Reply", async () => {
    const replyId = "test-reply-id";
    prismaMock.like.findFirst.mockResolvedValue(null);

    const createSpy = jest.spyOn(prismaMock.like, "create");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.likePost({ replyId });

    expect(result).toEqual({ success: true });
    expect(createSpy).toHaveBeenCalledWith({
      data: {
        replyId,
        authorId: userId,
      },
    });
  });

  test("Unlike a Post", async () => {
    const postId = "test-post-id";
    const existingLike = {
      id: "existing-like-id",
      authorId: userId,
      postId: postId,
      replyId: null,
    };
    prismaMock.like.findFirst.mockResolvedValue(existingLike);

    const deleteSpy = jest.spyOn(prismaMock.like, "delete");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.likePost({ postId });

    expect(result).toEqual({ success: true });
    expect(deleteSpy).toHaveBeenCalledWith({
      where: {
        id: existingLike.id,
      },
    });
  });

  test("Unlike a Reply", async () => {
    const replyId = "test-reply-id";
    const existingLike = {
      id: "existing-like-id",
      authorId: userId,
      postId: null,
      replyId: replyId,
    };
    prismaMock.like.findFirst.mockResolvedValue(existingLike);

    const deleteSpy = jest.spyOn(prismaMock.like, "delete");

    const caller = appRouter.createCaller({
      session: null,
      prisma: prismaMock,
      userId,
    });

    const result = await caller.posts.likePost({ replyId });

    expect(result).toEqual({ success: true });
    expect(deleteSpy).toHaveBeenCalledWith({
      where: {
        id: existingLike.id,
      },
    });
  });

  // You can add more test cases for scenarios like unliking a post or reply
});
