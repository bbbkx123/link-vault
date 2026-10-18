import Link from "next/link";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { buildHref } from "@/lib/format";

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  query: string;
  tag: string;
};

export function Pagination({
  page,
  totalPages,
  basePath,
  query,
  tag,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="收藏分页">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, { q: query, tag, page: page - 1 })}
          className="page-button"
        >
          <ChevronLeftIcon size={15} />
          上一页
        </Link>
      ) : (
        <span className="page-button is-disabled">
          <ChevronLeftIcon size={15} />
          上一页
        </span>
      )}

      <span className="page-position">
        {page} <span aria-hidden="true">/</span> {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, { q: query, tag, page: page + 1 })}
          className="page-button"
        >
          下一页
          <ChevronRightIcon size={15} />
        </Link>
      ) : (
        <span className="page-button is-disabled">
          下一页
          <ChevronRightIcon size={15} />
        </span>
      )}
    </nav>
  );
}
