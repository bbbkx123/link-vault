import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "注册",
};

export default async function RegisterPage() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    redirect("/dashboard");
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">START YOUR COLLECTION</p>
      <h1>建一座自己的图书馆。</h1>
      <p className="auth-lead">
        注册后立即拥有私有收藏夹，是否公开由你决定。
      </p>

      <AuthForm mode="register" />
    </div>
  );
}
