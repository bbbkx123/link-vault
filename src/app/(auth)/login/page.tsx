import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";
import { internalPathSchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "登录",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const rawCallback =
    typeof params.callbackUrl === "string" ? params.callbackUrl : "";

  // Auth.js hands back an absolute callback URL. Reduce it to an internal path
  // so the redirect can never leave the app.
  let callbackPath = "";
  if (rawCallback.startsWith("/") && !rawCallback.startsWith("//")) {
    callbackPath = rawCallback;
  } else if (rawCallback) {
    try {
      const parsedUrl = new URL(rawCallback);
      callbackPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
      callbackPath = "";
    }
  }

  const callbackUrl = internalPathSchema.safeParse(callbackPath);

  return (
    <div className="auth-card">
      <p className="eyebrow">WELCOME BACK</p>
      <h1>回到你的书架。</h1>
      <p className="auth-lead">
        登录后继续整理那些值得回看的东西。
      </p>

      <AuthForm
        mode="login"
        callbackUrl={callbackUrl.success ? callbackUrl.data : undefined}
      />

      {process.env.NODE_ENV !== "production" ? (
        <div className="demo-credentials">
          <span className="demo-label">LOCAL DEMO</span>
          <p>
            普通账号 <code>demo@linkvault.dev</code> /{" "}
            <code>Demo12345</code>
          </p>
          <p>
            管理员账号 <code>admin@linkvault.dev</code> /{" "}
            <code>Admin12345</code>
          </p>
        </div>
      ) : null}
    </div>
  );
}
