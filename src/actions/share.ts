"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { shareVisibilitySchema } from "@/lib/validation";

export async function setShareVisibilityAction(formData: FormData) {
  const user = await requireUser();
  const parsed = shareVisibilitySchema.safeParse({
    isPublic: formData.get("isPublic"),
  });

  if (!parsed.success) {
    redirect("/dashboard?notice=invalid");
  }

  const isPublic = parsed.data.isPublic === "true";

  await prisma.user.update({
    where: { id: user.id },
    data: { isPublic },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath(`/u/${user.username}`);
  redirect(`/dashboard?notice=${isPublic ? "shared" : "unshared"}`);
}
