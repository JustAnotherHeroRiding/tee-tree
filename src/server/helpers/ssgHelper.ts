import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";


export const generateSsgHelper = () => 
    createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null, session: null },
    transformer: superjson, // optional - adds superjson serialization
  });