"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { adminRoleSchema } from "@/lib/validation";

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = adminRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect("/admin?notice=invalid-role");
  }

  if (parsed.data.userId === admin.id) {
    redirect("/admin?notice=self-role");
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });

  if (!target) {
    redirect("/admin?notice=user-missing");
  }

  if (target.role === parsed.data.role) {
    redirect("/admin?notice=role-unchanged");
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { role: parsed.data.role },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  redirect("/admin?notice=role-updated");
}
