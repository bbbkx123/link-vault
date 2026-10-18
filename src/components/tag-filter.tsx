import Link from "next/link";

import { buildHref } from "@/lib/format";

type TagItem = {
  name: string;
  count: number;
};

type TagFilterProps = {
  tags: TagItem[];
  activeTag: string;
  basePath: string;
  query: string;
};

export function TagFilter({
  tags,
  activeTag,
  basePath,
  query,
}: TagFilterProps) {
  return (
    <div className="tag-filter" aria-label="按标签筛选">
      <Link
        href={buildHref(basePath, { q: query })}
        className={`tag-pill${activeTag ? "" : " is-active"}`}
        aria-current={activeTag ? undefined : "true"}
      >
        全部
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.name}
          href={buildHref(basePath, { q: query, tag: tag.name })}
          className={`tag-pill${activeTag === tag.name ? " is-active" : ""}`}
          aria-current={activeTag === tag.name ? "true" : undefined}
        >
          {tag.name}
          <span className="tag-pill-count">{tag.count}</span>
        </Link>
      ))}
    </div>
  );
}
