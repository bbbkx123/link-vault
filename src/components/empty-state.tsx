import { SearchIcon, TagIcon } from "@/components/icons";

type EmptyStateProps = {
  variant: "collection" | "search";
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  variant,
  title,
  description,
  action,
}: EmptyStateProps) {
  const fallbackTitle =
    variant === "search" ? "没有找到匹配的收藏" : "书架还是空的";
  const fallbackDescription =
    variant === "search"
      ? "换一个关键词，或者清除标签筛选再看看。"
      : "把正在读的文章、常用的工具、舍不得丢的灵感都收进来。";

  return (
    <div className="empty-state">
      <span className="empty-icon" aria-hidden="true">
        {variant === "search" ? <SearchIcon size={24} /> : <TagIcon size={24} />}
      </span>
      <h3>{title ?? fallbackTitle}</h3>
      <p>{description ?? fallbackDescription}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
