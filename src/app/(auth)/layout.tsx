import Link from "next/link";

import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <header className="auth-header">
        <Logo />
        <Link href="/" className="site-link">
          ← 返回首页
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-content">{children}</div>

        <aside className="auth-story" aria-hidden="true">
          <div className="auth-story-top">
            <span>A NOTE ON COLLECTING</span>
            <span>拾 / 链</span>
          </div>

          <div className="auth-quote">
            <span className="auth-quote-mark">「</span>
            <p>
              收藏不是囤积，
              <br />
              是为未来的自己
              <br />
              <em>留一条回去的路。</em>
            </p>
          </div>

          <div className="auth-story-foot">
            <div className="story-tags">
              <span>设计</span>
              <span>开发</span>
              <span>阅读</span>
              <span>灵感</span>
              <span>+</span>
            </div>
            <p>LINKVAULT · EST. 2026</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
