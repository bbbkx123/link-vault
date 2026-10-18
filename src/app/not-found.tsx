import Link from "next/link";

import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="not-found-shell">
      <header className="not-found-header">
        <Logo />
        <Link href="/" className="site-link">
          ← 返回首页
        </Link>
      </header>

      <main className="not-found-main">
        <p className="eyebrow">404 · MISSING PAGE</p>
        <h1>
          这一页，
          <br />
          像被从书架上抽走了。
        </h1>
        <p>
          可能它从未存在，也可能收藏夹的主人刚刚关闭了公开分享。
          不如回到首页，重新找一条路。
        </p>
        <div className="not-found-actions">
          <Link href="/" className="btn btn-primary">
            回到首页
          </Link>
          <Link href="/dashboard" className="btn btn-ghost">
            我的收藏夹
          </Link>
        </div>
        <span className="not-found-index" aria-hidden="true">
          404
        </span>
      </main>
    </div>
  );
}
