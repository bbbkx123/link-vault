import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="container container--narrow">
      <div className="error-state">
        <p className="eyebrow">404 · MISSING PAGE</p>
        <h1>这一页暂时找不到。</h1>
        <p>
          它可能已经被删除，或者不属于你的收藏夹。检查一下地址，
          也可以回到书架继续浏览。
        </p>
        <div className="error-actions">
          <Link href="/dashboard" className="btn btn-primary">
            回到收藏夹
          </Link>
          <Link href="/" className="btn btn-ghost">
            回到首页
          </Link>
        </div>
      </div>
    </div>
  );
}
