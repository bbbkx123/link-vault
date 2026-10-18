import type { Metadata } from "next";
import Link from "next/link";

import { updateUserRoleAction } from "@/actions/admin";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { Flash } from "@/components/flash";
import {
  ArrowUpRightIcon,
  GlobeIcon,
  ShieldIcon,
} from "@/components/icons";
import {
  formatLongDate,
  formatShortDate,
  getDomain,
  initialOf,
  siteInitial,
  toneFor,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "管理后台",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const [
    users,
    recentLinks,
    userCount,
    linkCount,
    publicCount,
    adminCount,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isPublic: true,
        createdAt: true,
        _count: {
          select: { links: true, tags: true },
        },
      },
    }),
    prisma.link.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        url: true,
        createdAt: true,
        user: {
          select: { name: true, username: true },
        },
      },
    }),
    prisma.user.count(),
    prisma.link.count(),
    prisma.user.count({ where: { isPublic: true } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
  ]);

  const notice = typeof params.notice === "string" ? params.notice : undefined;

  return (
    <div className="container">
      <header className="page-heading">
        <div>
          <p className="eyebrow admin-eyebrow">
            <ShieldIcon size={13} />
            ADMIN CONSOLE
          </p>
          <h1>管理后台</h1>
          <p>查看注册用户，并调整管理员权限。</p>
        </div>
        <span className="admin-badge">仅管理员可见</span>
      </header>

      <Flash code={notice} />

      <div className="stats-row stats-row--four">
        <div className="stat">
          <span className="stat-label">注册用户</span>
          <strong>{userCount}</strong>
          <span className="stat-unit">MEMBERS</span>
        </div>
        <div className="stat">
          <span className="stat-label">全部收藏</span>
          <strong>{linkCount}</strong>
          <span className="stat-unit">LINKS</span>
        </div>
        <div className="stat">
          <span className="stat-label">公开主页</span>
          <strong>{publicCount}</strong>
          <span className="stat-unit">PUBLIC</span>
        </div>
        <div className="stat">
          <span className="stat-label">管理员</span>
          <strong>{adminCount}</strong>
          <span className="stat-unit">ADMINS</span>
        </div>
      </div>

      <section className="admin-section" aria-labelledby="members-title">
        <div className="section-bar">
          <div>
            <p className="eyebrow">MEMBERS</p>
            <h2 id="members-title" className="section-title">
              所有用户
            </h2>
          </div>
          <span className="admin-count">{users.length} 人</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">用户</th>
                <th scope="col">角色</th>
                <th scope="col">收藏 / 标签</th>
                <th scope="col">公开主页</th>
                <th scope="col">加入时间</th>
                <th scope="col" className="ta-right">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((member) => {
                const isSelf = member.id === admin.id;
                const nextRole =
                  member.role === "ADMIN" ? "USER" : "ADMIN";

                return (
                  <tr key={member.id}>
                    <td>
                      <div className="member-cell">
                        <span className="avatar avatar--sm">
                          {initialOf(member.name)}
                        </span>
                        <div>
                          <strong>
                            {member.name}
                            {isSelf ? (
                              <span className="self-tag">当前账号</span>
                            ) : null}
                          </strong>
                          <span className="member-email">{member.email}</span>
                          <span className="member-handle">
                            @{member.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`role-badge ${
                          member.role === "ADMIN" ? "is-admin" : ""
                        }`}
                      >
                        {member.role === "ADMIN" ? (
                          <ShieldIcon size={12} />
                        ) : null}
                        {member.role === "ADMIN" ? "管理员" : "普通用户"}
                      </span>
                    </td>
                    <td>
                      <span className="table-number">
                        {member._count.links}
                      </span>
                      <span className="table-sub">
                        / {member._count.tags} 标签
                      </span>
                    </td>
                    <td>
                      {member.isPublic ? (
                        <Link
                          href={`/u/${member.username}`}
                          target="_blank"
                          className="public-link"
                        >
                          <GlobeIcon size={13} />
                          公开
                          <ArrowUpRightIcon size={11} />
                        </Link>
                      ) : (
                        <span className="muted">未公开</span>
                      )}
                    </td>
                    <td>
                      <time
                        className="table-date"
                        dateTime={member.createdAt.toISOString()}
                      >
                        {formatLongDate(member.createdAt)}
                      </time>
                    </td>
                    <td className="ta-right">
                      {isSelf ? (
                        <span className="muted">不可修改</span>
                      ) : (
                        <form action={updateUserRoleAction}>
                          <input
                            type="hidden"
                            name="userId"
                            value={member.id}
                          />
                          <input type="hidden" name="role" value={nextRole} />
                          <ConfirmSubmit
                            className="btn btn-ghost btn-xs"
                            confirmMessage={
                              nextRole === "ADMIN"
                                ? `确定将「${member.name}」设为管理员吗？对方将可以访问管理后台。`
                                : `确定取消「${member.name}」的管理员权限吗？`
                            }
                          >
                            {nextRole === "ADMIN"
                              ? "设为管理员"
                              : "设为普通用户"}
                          </ConfirmSubmit>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="admin-note">
          角色变更在对方下一次进入页面时生效。管理员不能修改自己的角色，
          以避免误操作后失去管理入口。
        </p>
      </section>

      <section className="admin-section" aria-labelledby="recent-title">
        <div className="section-bar">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h2 id="recent-title" className="section-title">
              最近收藏
            </h2>
          </div>
          <span className="admin-count">最新 {recentLinks.length} 条</span>
        </div>

        {recentLinks.length > 0 ? (
          <div className="recent-list">
            {recentLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="recent-item"
              >
                <span
                  className={`site-mark site-mark--sm tone-${toneFor(
                    getDomain(link.url),
                  )}`}
                  aria-hidden="true"
                >
                  {siteInitial(link.url)}
                </span>
                <span className="recent-copy">
                  <strong>{link.title}</strong>
                  <span>{getDomain(link.url)}</span>
                </span>
                <span className="recent-owner">
                  {link.user.name} · @{link.user.username}
                </span>
                <time
                  className="recent-date"
                  dateTime={link.createdAt.toISOString()}
                >
                  {formatShortDate(link.createdAt)}
                </time>
                <ArrowUpRightIcon size={14} />
              </a>
            ))}
          </div>
        ) : (
          <p className="admin-empty">还没有任何收藏。</p>
        )}
      </section>
    </div>
  );
}
