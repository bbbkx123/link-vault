"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getDownloadUrl, uploadJsonObject } from "@/lib/storage";

const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  owner: z.object({
    id: z.string(),
    name: z.string(),
    username: z.string(),
  }),
  links: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      createdAt: z.string().datetime(),
      tags: z.array(z.string()),
    }),
  ),
});

export async function exportCollectionBackupAction() {
  const user = await requireUser();
  const links = await prisma.link.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
      createdAt: true,
      tags: {
        select: { tag: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const payload = backupSchema.parse({
    version: 1,
    exportedAt: new Date().toISOString(),
    owner: {
      id: user.id,
      name: user.name,
      username: user.username,
    },
    links: links.map((link) => ({
      id: link.id,
      url: link.url,
      title: link.title,
      description: link.description,
      createdAt: link.createdAt.toISOString(),
      tags: link.tags
        .map((entry) => entry.tag.name)
        .sort((left, right) => left.localeCompare(right, "zh-CN")),
    })),
  });

  const objectKey = `backups/${user.id}/collection.json`;
  const fileName = `linkvault-${user.username}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  try {
    await uploadJsonObject(objectKey, JSON.stringify(payload, null, 2));
    const url = await getDownloadUrl(objectKey, fileName);
    return { ok: true as const, url, fileName, count: links.length };
  } catch (error) {
    console.error("Failed to export collection to Neon Object Storage", error);
    return {
      ok: false as const,
      message: "备份生成失败，请确认 Neon Object Storage 配置后再试。",
    };
  }
}
