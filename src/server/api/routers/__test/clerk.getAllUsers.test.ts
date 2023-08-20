import { test, expect, afterAll } from "@jest/globals";
import { appRouter } from "../../root";
import { prisma } from "../../../db";
/* import { Ratelimit as RealRatelimit } from "@upstash/ratelimit";

jest.mock("@upstash/ratelimit", () => {
  let postRequestCount = 0;

  const slidingWindow = (requests: number, duration: string) => {
    // Return a function that will act as the limiter
    return () => {
      if (postRequestCount < requests) {
        postRequestCount += 1;
        setTimeout(() => (postRequestCount -= 1), 60000); // Reset count after a minute
        return true; // Allow the request
      }
      return false; // Reject the request
    };
  };

  const Ratelimit = jest.fn().mockImplementation(() => ({
    check: jest.fn((operationType) => {
      return operationType !== "post" || slidingWindow(3, "1 m")();
    }),
    // Add other methods and properties as needed
  }));

  Ratelimit.slidingWindow = slidingWindow;

  return {
    Ratelimit,
  };
}); */


afterAll(async () => {
  // Disconnect Prisma
  await prisma.$disconnect();
});

test("Get all users test", async () => {
  const caller = appRouter.createCaller({
    session: null,
    prisma: prisma,
    userId: null,
  });

  const result = await caller.clerk.getAllUsers();

  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: expect.stringMatching(/\S/),
        username: expect.any(String),
        profileImageUrl: expect.stringMatching(/\S/),
        firstName: expect.any(String),
        lastName: expect.any(String),
      }),
    ])
  );
}, 5000);
