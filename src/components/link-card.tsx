import Link from "next/link";

import { deleteLinkAction } from "@/actions/links";
import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  ArrowUpRightIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/icons";
import {
  buildHref,
  formatShortDate,
  getDomain,
  siteInitial,
  toneFor,
} from "@/lib/format";
import type { LinkCardRecord } from "@/lib/link-queries";

type LinkCardProps = {
  link: LinkCardRecord;
  tagBasePath: string;
  showActions?: boolean;
};

export function LinkCard({
  link,
  tagBasePath,
  showActions = false,
}: LinkCardProps) {
  const domain = getDomain(link.url);
  const tags = link.tags
    .map((entry) => entry.tag)
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

  return (
    <article className="link-card">
      <div className="link-card-top">
        <span
          className={`site-mark tone-${toneFor(domain)}`}
          aria-hidden="true"
        >
          {siteInitial(link.url)}
        </span>
        <span className="link-domain" title={domain}>
          {domain}
        </span>
        <time
          className="link-date"
          dateTime={link.createdAt.toISOString()}
          title={link.createdAt.toLocaleString("zh-CN")}
        >
          {formatShortDate(link.createdAt)}
        </time>
      </div>

      <h3 className="link-title">
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          {link.title}
          <ArrowUpRightIcon size={15} className="link-title-arrow" />
        </a>
      </h3>

      <p className={`link-description${link.description ? "" : " is-empty"}`}>
        {link.description || "还没有写备注。"}
      </p>

      <div className="link-card-footer">
        <div className="link-tags">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Link
                key={tag.id}
                href={buildHref(tagBasePath, { tag: tag.name })}
                className="tag"
              >
                {tag.name}
              </Link>
            ))
          ) : (
            <span className="tag tag--empty">未分类</span>
          )}
        </div>

        {showActions ? (
          <div className="link-actions">
            <Link
              href={`/links/${link.id}/edit`}
              className="icon-btn"
              aria-label={`编辑 ${link.title}`}
              title="编辑"
            >
              <PencilIcon size={15} />
            </Link>
            <form action={deleteLinkAction} className="inline-form">
              <input type="hidden" name="linkId" value={link.id} />
              <ConfirmSubmit
                className="icon-btn icon-btn--danger"
                confirmMessage={`确定删除「${link.title}」吗？此操作不可撤销。`}
                title="删除"
              >
                <TrashIcon size={15} />
                <span className="sr-only">删除 {link.title}</span>
              </ConfirmSubmit>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
}
