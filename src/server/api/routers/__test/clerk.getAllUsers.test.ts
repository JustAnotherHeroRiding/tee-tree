import { test, expect } from "@jest/globals";
import { appRouter } from "../../root";
import { prisma } from "../../../db";
//import { type inferProcedureInput } from "@trpc/server";




test("Get all users test", async () => {
    const caller = appRouter.createCaller({session: null, prisma: prisma, userId: null});
  
  
  
    const result = await caller.clerk.getAllUsers();
  
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.stringMatching(/\S/),
        username: expect.any(String),
        profileImageUrl: expect.stringMatching(/\S/),
        firstName: expect.any(String),
        lastName: expect.any(String),
      })
    ]));
  }, 10000);