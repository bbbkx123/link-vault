import "server-only";

import type { Prisma } from "@prisma/client";

export const LINKS_PER_PAGE = 8;

export const linkCardSelect = {
  id: true,
  url: true,
  title: true,
  description: true,
  createdAt: true,
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.LinkSelect;

export type LinkCardRecord = Prisma.LinkGetPayload<{
  select: typeof linkCardSelect;
}>;

export function buildLinkWhere(
  userId: string,
  query: string,
  tag: string,
): Prisma.LinkWhereInput {
  return {
    userId,
    ...(tag ? { tags: { some: { tag: { userId, name: tag } } } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { url: { contains: query, mode: "insensitive" } },
            {
              tags: {
                some: {
                  tag: {
                    userId,
                    name: { contains: query, mode: "insensitive" },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };
}
