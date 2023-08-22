/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect } from "@jest/globals";
import { appRouter } from "../../root";
import { mockDeep } from "jest-mock-extended";
import { type PrismaClient } from "@prisma/client";
import {
  addUserDataToPosts,
  addUserDataToReplies,
  sortReplies,
} from "../posts";
import type {
  ExtendedPost,
  ReplyWithParent,
  PostWithAuthor,
  PostAuthor,
} from "../posts";
import { createInnerTRPCContext } from "../../trpc";
import { prisma } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { after } from "lodash";

/* jest.mock("../posts", () => ({
  addUserDataToPosts: jest.fn((posts) => posts as ExtendedPost[]),
  addUserDataToReplies: jest.fn((replies) => replies as ExtendedPost[]),
  sortReplies: jest.fn((replies) => replies as ReplyWithParent[]),
})); */
afterAll(async () => {
  // Disconnect Prisma
  await prisma.$disconnect();
});
test("Get Post By ID Mock", async () => {
/*   const prismaMock = mockDeep<PrismaClient>();

 


  const postAuthor: PostAuthor = {
    username: "test-user",
    id: "author-id",
    profileImageUrl: "image-url",
    firstName: "John",
    lastName: "Doe",
  };

  const mockPost: PostWithAuthor = {
    post: {
      id: "test-id",
      createdAt: new Date(),
      content: "Test content",
      imageUrl: null,
      gifUrl: null,
      videoUrl: null,
      authorId: "test-author",
      isEdited: false,
      dataType: "post",
      likes: [],
      retweets: [],
      replies: [],
      parentId: null,
      parentReply: null,
      post: null,
      postId: null,
      author: postAuthor,
    },
    author: postAuthor,
  };

  const mockReplies: ReplyWithParent[] = [
    {
      post: {
        id: "reply-id",
        createdAt: new Date(),
        content: "Test reply content",
        imageUrl: null,
        gifUrl: null,
        videoUrl: null,
        authorId: "test-author",
        isEdited: false,
        dataType: "post",
        likes: [],
        retweets: [],
        replies: [],
        parentId: null,
        parentReply: null,
        post: null,
        postId: null,
        author: undefined,
        // Add other required properties of ExtendedPost here if needed
      },
      author: {
        username: "reply-user",
        id: "reply-author-id",
        profileImageUrl: "reply-image-url",
        firstName: "Jane",
        lastName: "Doe",
      },
      parentPost: mockPost,
    },
  ];

  prismaMock.post.findUnique.mockResolvedValue(mockPost.post);

  (addUserDataToReplies as jest.Mock).mockReturnValue(mockReplies); */


  const caller = appRouter.createCaller({
    session: null,
    prisma: prisma,
    userId: null,
  });


  const latestPost = await caller.posts.getOneExample()
  if (!latestPost) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Latest post not found.",
    });
  }

  const result = await caller.posts.getById({ id: latestPost.id });

  // Expect that the result has the correct shape
  /* expect(result).toEqual({
    ...mockPost,
    replies: sortReplies(mockReplies),
  }); */

  expect(result).toBeTruthy();

});
