import Link from "next/link";

import { Logo } from "@/components/logo";

type SiteHeaderProps = {
  user: { name: string } | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Logo />
      <nav className="site-nav" aria-label="账户导航">
        {user ? (
          <>
            <span className="site-greeting">你好，{user.name}</span>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              我的收藏夹
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="site-link">
              登录
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              免费注册
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
