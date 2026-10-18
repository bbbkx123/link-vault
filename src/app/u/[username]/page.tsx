import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { ArrowUpRightIcon, GlobeIcon, PlusIcon } from "@/components/icons";
import { LinkCard } from "@/components/link-card";
import { Logo } from "@/components/logo";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { SiteHeader } from "@/components/site-header";
import { TagFilter } from "@/components/tag-filter";
import { formatLongDate, initialOf } from "@/lib/format";
import {
  buildLinkWhere,
  LINKS_PER_PAGE,
  linkCardSelect,
} from "@/lib/link-queries";
import { prisma } from "@/lib/prisma";
import { browseQuerySchema, usernameSchema } from "@/lib/validation";

const getPublicOwner = cache(async (username: string) => {
  return prisma.user.findFirst({
    where: { username, isPublic: true },
    select: {
      id: true,
      name: true,
      username: true,
      createdAt: true,
      _count: { select: { links: true } },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const parsed = usernameSchema.safeParse((await params).username);
  if (!parsed.success) {
    return { title: "收藏夹未找到", robots: { index: false } };
  }

  const owner = await getPublicOwner(parsed.data);
  if (!owner) {
    return { title: "收藏夹未找到", robots: { index: false } };
  }

  const title = `${owner.name}的收藏夹`;
  const description = `${owner.name} 在拾链上公开收藏的链接与标签，一个不靠算法推荐的私人索引。`;

  return {
    title,
    description,
    alternates: { canonical: `/u/${owner.username}` },
    openGraph: {
      title,
      description,
      type: "profile",
      locale: "zh_CN",
      siteName: "拾链 LinkVault",
    },
  };
}

export default async function PublicCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parsedUsername = usernameSchema.safeParse((await params).username);
  if (!parsedUsername.success) {
    notFound();
  }

  const owner = await getPublicOwner(parsedUsername.data);
  if (!owner) {
    notFound();
  }

  const paramsValue = await searchParams;
  const query = browseQuerySchema.parse(paramsValue);
  const { q, tag } = query;
  const session = await auth();
  const isOwner = session?.user?.id === owner.id;

  const where = buildLinkWhere(owner.id, q, tag);
  const [tags, filteredCount] = await Promise.all([
    prisma.tag.findMany({
      where: { userId: owner.id, links: { some: {} } },
      select: {
        name: true,
        _count: { select: { links: true } },
      },
    }),
    prisma.link.count({ where }),
  ]);

  const tagItems = tags
    .map((item) => ({ name: item.name, count: item._count.links }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.name.localeCompare(right.name, "zh-CN"),
    );

  const totalPages = Math.max(1, Math.ceil(filteredCount / LINKS_PER_PAGE));
  const currentPage = Math.min(query.page, totalPages);

  const links = await prisma.link.findMany({
    where,
    select: linkCardSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (currentPage - 1) * LINKS_PER_PAGE,
    take: LINKS_PER_PAGE,
  });

  const basePath = `/u/${owner.username}`;
  const hasFilters = Boolean(q || tag);

  return (
    <div className="public-shell">
      <SiteHeader
        user={
          session?.user ? { name: session.user.name ?? "朋友" } : null
        }
      />

      <main>
        <section className="public-hero">
          <div className="public-hero-copy">
            <p className="eyebrow">
              <GlobeIcon size={13} />
              PUBLIC COLLECTION
            </p>
            <h1>{owner.name}的收藏夹</h1>
            <p className="public-handle">@{owner.username}</p>
            <p className="public-lead">
              在互联网里捡到的好东西，都放在这里。
            </p>

            <div className="public-meta">
              <span>{owner._count.links} 条收藏</span>
              <span>{tagItems.length} 个标签</span>
              <span>始于 {formatLongDate(owner.createdAt)}</span>
            </div>

            {isOwner ? (
              <div className="public-owner-bar">
                <Link href="/dashboard" className="btn btn-primary btn-sm">
                  回到我的收藏夹
                  <ArrowUpRightIcon size={14} />
                </Link>
                <span>这是你的公开主页</span>
              </div>
            ) : null}
          </div>

          <div className="public-stamp" aria-hidden="true">
            <span className="public-stamp-inner">{initialOf(owner.name)}</span>
            <span className="public-stamp-ring" />
            <span className="public-stamp-label">
              PUBLIC
              <br />
              COLLECTION
            </span>
          </div>
        </section>

        <div className="public-body">
          <div className="section-bar">
            <div>
              <p className="eyebrow">THE SHELF</p>
              <h2 className="section-title">书架</h2>
            </div>
            <SearchForm
              basePath={basePath}
              query={q}
              tag={tag}
              placeholder="在这个收藏夹里搜索"
            />
          </div>

          <div className="toolbar">
            <TagFilter
              tags={tagItems}
              activeTag={tag}
              query={q}
              basePath={basePath}
            />
          </div>

          <div className="result-meta">
            <span>
              {filteredCount} 条{hasFilters ? "匹配结果" : "公开收藏"}
              {q ? ` · 关键词「${q}」` : ""}
              {tag ? ` · 标签「${tag}」` : ""}
            </span>
            {hasFilters ? (
              <Link href={basePath} className="clear-filter">
                清除筛选
              </Link>
            ) : null}
          </div>

          {links.length > 0 ? (
            <div className="links-grid links-grid--public">
              {links.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  tagBasePath={basePath}
                />
              ))}
            </div>
          ) : hasFilters ? (
            <EmptyState
              variant="search"
              action={
                <Link href={basePath} className="btn btn-ghost btn-sm">
                  清除筛选
                </Link>
              }
            />
          ) : (
            <EmptyState
              variant="collection"
              title="这里还没有收藏"
              description="等主人收下第一个值得回看的链接。"
            />
          )}

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            query={q}
            tag={tag}
          />
        </div>
      </main>

      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="public-footer-brand">
            <Logo />
            <p>一个可公开分享的私人收藏夹。</p>
          </div>
          <div className="public-footer-cta">
            <span>也想整理自己的网？</span>
            <Link
              href={session?.user ? "/dashboard" : "/register"}
              className="btn btn-primary btn-sm"
            >
              {session?.user ? (
                "打开我的收藏夹"
              ) : (
                <>
                  <PlusIcon size={14} />
                  创建自己的收藏夹
                </>
              )}
            </Link>
          </div>
        </div>
        <div className="public-footer-base">
          <span>公开内容由 @{owner.username} 维护</span>
          <span>POWERED BY 拾链 LINKVAULT</span>
        </div>
      </footer>
    </div>
  );
}
