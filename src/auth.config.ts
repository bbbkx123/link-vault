import type { NextAuthConfig } from "next-auth";

const PROTECTED_PREFIXES = ["/dashboard", "/links", "/admin"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      if (!isProtectedPath(request.nextUrl.pathname)) {
        return true;
      }
      return Boolean(auth?.user?.id);
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.role = user.role === "ADMIN" ? "ADMIN" : "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // JWT fields are opaque to TypeScript here, so narrow them at runtime.
        session.user.id =
          (typeof token.id === "string" ? token.id : token.sub) ?? "";
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
