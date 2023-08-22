import { test, expect } from "@jest/globals";
import { appRouter } from "../../root";
import { mockDeep } from "jest-mock-extended";
import { type PrismaClient } from "@prisma/client";
import { addUserDataToPosts, addUserDataToReplies, sortReplies } from "../posts";
import type { ExtendedPost, PostWithAuthor, ReplyWithParent } from "../posts";

jest.mock('../posts', () => ({
  addUserDataToPosts: jest.fn((posts) => posts as ExtendedPost[]),
  addUserDataToReplies: jest.fn((replies) => replies as ExtendedPost[]),
  sortReplies: jest.fn((replies) => replies as ReplyWithParent[]),
}));
test('Get Post By ID Mock', async () => {
  const prismaMock = mockDeep<PrismaClient>();

// Example post object structure
const mockPost: PostWithAuthor = {
    post: {
      id: 'test-id',
      createdAt: new Date(),
      content: 'Test content',
      imageUrl: null,
      gifUrl: null,
      videoUrl: null,
      authorId: 'test-author',
      isEdited: false,
      dataType: 'post',
      likes: [],
      retweets: [],
      replies: [],
    },
    author: {
      username: 'test-user',
      id: 'author-id',
      profileImageUrl: 'image-url',
      firstName: 'John',
      lastName: 'Doe',
    }
  };
  
  // Example reply with parent post
  const mockReplies: ReplyWithParent[] = [
    {
      post: {
        id: 'reply-id',
        createdAt: new Date(),
        content: 'Test reply content',
        imageUrl: null,
        gifUrl: null,
        videoUrl: null,
        authorId: 'test-author',
        isEdited: false,
        dataType: 'post',
        likes: [],
        retweets: [],
        replies: [],
      },
      author: {
        username: 'reply-user',
        id: 'reply-author-id',
        profileImageUrl: 'reply-image-url',
        firstName: 'Jane',
        lastName: 'Doe',
      },
      parentPost: mockPost,
    }
  ];

  // Mock the Prisma call to return the mock post
  prismaMock.post.findUnique.mockResolvedValue(mockPost.post);

  // Mock the replies functions to return mock replies
  (addUserDataToReplies as jest.Mock).mockReturnValue(mockReplies);

  const caller = appRouter.createCaller({
    session: null,
    prisma: prismaMock,
    userId: null,
  });

  
  const result = await caller.posts.getById({ id: 'test-id' });

  // Expect that the result has the correct shape
  expect(result).toEqual({
    ...mockPost,
    replies: sortReplies(mockReplies),
  });
});
