import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",

    // let the api authentication be handled by trpc middleware
    "/api(.*)",
    "/trpc(.*)",
    "/post/:id",
    "/:slug",
    "/following/:slug",
    "/followers/:slug",
    "/i/trends",
    "/i/search(.*)"    
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};