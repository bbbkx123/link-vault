"use client";

import Link from "next/link";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container container--narrow">
      <div className="error-state">
        <p className="eyebrow">SOMETHING WENT WRONG</p>
        <h1>这一页暂时没有回应。</h1>
        <p>
          可能是数据库连接或一次操作出了问题。可以重新加载这一页，
          或者回到收藏夹继续浏览。
        </p>
        <div className="error-actions">
          <button type="button" className="btn btn-primary" onClick={reset}>
            重新加载
          </button>
          <Link href="/dashboard" className="btn btn-ghost">
            回到收藏夹
          </Link>
        </div>
      </div>
    </div>
  );
}
