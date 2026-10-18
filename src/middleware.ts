import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Uses the Prisma-free auth config so the middleware can run on the edge runtime.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/links/:path*", "/admin/:path*"],
};
