"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { FormState } from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { titleFromUrl } from "@/lib/format";
import {
  fieldErrorsFrom,
  idSchema,
  linkInputSchema,
} from "@/lib/validation";

function tagWrites(userId: string, names: string[]) {
  return names.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { userId_name: { userId, name } },
        create: { name, userId },
      },
    },
  }));
}

function revalidateLinkViews(username: string) {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath(`/u/${username}`);
}

async function removeOrphanTags(userId: string) {
  await prisma.tag.deleteMany({
    where: {
      userId,
      links: { none: {} },
    },
  });
}

export async function createLinkAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = linkInputSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查标出的字段后再试一次。",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await prisma.link.create({
      data: {
        userId: user.id,
        url: parsed.data.url,
        title: parsed.data.title || titleFromUrl(parsed.data.url),
        description: parsed.data.description || null,
        tags: {
          create: tagWrites(user.id, parsed.data.tags),
        },
      },
    });
  } catch (error) {
    console.error("Failed to create link", error);
    return {
      status: "error",
      message: "链接没有保存成功，请稍后再试。",
    };
  }

  revalidateLinkViews(user.username);
  redirect("/dashboard?notice=created");
}

export async function updateLinkAction(
  linkId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(linkId);

  if (!parsedId.success) {
    return { status: "error", message: "无效的收藏记录。" };
  }

  const parsed = linkInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查标出的字段后再试一次。",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const existing = await prisma.link.findFirst({
    where: { id: parsedId.data, userId: user.id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: "error",
      message: "这条收藏不存在，或者你没有权限编辑它。",
    };
  }

  try {
    await prisma.link.update({
      where: { id: existing.id },
      data: {
        url: parsed.data.url,
        title: parsed.data.title || titleFromUrl(parsed.data.url),
        description: parsed.data.description || null,
        tags: {
          deleteMany: {},
          create: tagWrites(user.id, parsed.data.tags),
        },
      },
    });
    await removeOrphanTags(user.id);
  } catch (error) {
    console.error("Failed to update link", error);
    return {
      status: "error",
      message: "修改没有保存成功，请稍后再试。",
    };
  }

  revalidateLinkViews(user.username);
  redirect("/dashboard?notice=updated");
}

export async function deleteLinkAction(formData: FormData) {
  const user = await requireUser();
  const parsed = idSchema.safeParse(formData.get("linkId"));

  if (!parsed.success) {
    redirect("/dashboard?notice=invalid");
  }

  const result = await prisma.link.deleteMany({
    where: { id: parsed.data, userId: user.id },
  });

  if (result.count === 0) {
    redirect("/dashboard?notice=not-found");
  }

  await removeOrphanTags(user.id);
  revalidateLinkViews(user.username);
  redirect("/dashboard?notice=deleted");
}
