import { clerkClient } from "@clerk/nextjs";
//import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/FilterUserForClient";


export const clerkRouter = createTRPCRouter({
    getUserById: publicProcedure.input(z.object({ userId: z.string().optional() })).
        query(async ({ input }) => {
            if (!input.userId) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Id is invalid or was not provided"
                });
            }
            const user = await clerkClient.users.getUser(input.userId);
            if (!user) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "User not found"
                });
            }
            return filterUserForClient(user);
        }),

        getAllUsers: publicProcedure.query(async () => {
            const users = await clerkClient.users.getUserList();
            if (!users) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Users not found"
                });
            }

            return users.map(filterUserForClient);
        }),
});