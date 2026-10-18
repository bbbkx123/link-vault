import type { Metadata } from "next";
import Link from "next/link";

import { createLinkAction } from "@/actions/links";
import { BackupButton } from "@/components/backup-button";
import { EmptyState } from "@/components/empty-state";
import { Flash } from "@/components/flash";
import { LinkCard } from "@/components/link-card";
import { LinkForm } from "@/components/link-form";
import { Pagination } from "@/components/pagination";
import { SearchForm } from "@/components/search-form";
import { SharePanel } from "@/components/share-panel";
import { TagFilter } from "@/components/tag-filter";
import { PlusIcon } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import {
  buildLinkWhere,
  LINKS_PER_PAGE,
  linkCardSelect,
} from "@/lib/link-queries";
import { requireUser } from "@/lib/session";
import { browseQuerySchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "我的收藏",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const query = browseQuerySchema.parse(params);
  const { q, tag } = query;

  const where = buildLinkWhere(user.id, q, tag);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totalLinks, tags, monthCount, filteredCount] = await Promise.all([
    prisma.link.count({ where: { userId: user.id } }),
    prisma.tag.findMany({
      where: { userId: user.id, links: { some: {} } },
      select: {
        name: true,
        _count: { select: { links: true } },
      },
    }),
    prisma.link.count({
      where: { userId: user.id, createdAt: { gte: monthStart } },
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

  const hasFilters = Boolean(q || tag);
  const notice = typeof params.notice === "string" ? params.notice : undefined;

  return (
    <div className="container">
      <header className="page-heading">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h1>我的收藏夹</h1>
          <p>共 {totalLinks} 条链接，按自己的节奏慢慢整理。</p>
        </div>
        <div className="page-actions">
          <BackupButton />
          <Link href="#add-link" className="btn btn-primary">
            <PlusIcon size={16} />
            添加链接
          </Link>
        </div>
      </header>

      <Flash code={notice} />

      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">收藏总数</span>
          <strong>{totalLinks}</strong>
          <span className="stat-unit">LINKS</span>
        </div>
        <div className="stat">
          <span className="stat-label">收录标签</span>
          <strong>{tagItems.length}</strong>
          <span className="stat-unit">TAGS</span>
        </div>
        <div className="stat">
          <span className="stat-label">本月新增</span>
          <strong>{monthCount}</strong>
          <span className="stat-unit">THIS MONTH</span>
        </div>
      </div>

      <SharePanel isPublic={user.isPublic} username={user.username} />

      <section className="add-card" id="add-link" aria-labelledby="add-title">
        <div className="add-card-head">
          <div>
            <p className="eyebrow">ADD A LINK</p>
            <h2 id="add-title">收藏一条新链接</h2>
          </div>
          <span className="add-hint">粘贴链接，其他交给标签</span>
        </div>
        <LinkForm action={createLinkAction} submitLabel="收藏链接" />
      </section>

      <section aria-labelledby="collection-title">
        <div className="section-bar">
          <div>
            <p className="eyebrow">BROWSE</p>
            <h2 id="collection-title" className="section-title">
              书架
            </h2>
          </div>
          <SearchForm basePath="/dashboard" query={q} tag={tag} />
        </div>

        <div className="toolbar">
          <TagFilter
            tags={tagItems}
            activeTag={tag}
            query={q}
            basePath="/dashboard"
          />
        </div>

        <div className="result-meta">
          <span>
            {filteredCount} 条{hasFilters ? "匹配结果" : "收藏"}
            {q ? ` · 关键词「${q}」` : ""}
            {tag ? ` · 标签「${tag}」` : ""}
          </span>
          {hasFilters ? (
            <Link href="/dashboard" className="clear-filter">
              清除筛选
            </Link>
          ) : null}
        </div>

        {links.length > 0 ? (
          <div className="links-grid">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                tagBasePath="/dashboard"
                showActions
              />
            ))}
          </div>
        ) : hasFilters ? (
          <EmptyState
            variant="search"
            action={
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                清除筛选
              </Link>
            }
          />
        ) : (
          <EmptyState
            variant="collection"
            action={
              <a href="#add-link" className="btn btn-primary btn-sm">
                收藏第一条链接
              </a>
            }
          />
        )}

        <Pagination
          page={currentPage}
          totalPages={totalPages}
          basePath="/dashboard"
          query={q}
          tag={tag}
        />
      </section>
    </div>
  );
}
