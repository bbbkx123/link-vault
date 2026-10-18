import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { LogOutIcon, ShieldIcon } from "@/components/icons";
import { initialOf } from "@/lib/format";

type AppHeaderProps = {
  user: {
    name: string;
    username: string;
    role: "USER" | "ADMIN";
  };
};

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-left">
          <Logo href="/dashboard" showTagline={false} />
          <nav className="app-nav" aria-label="主导航">
            <Link href="/dashboard">我的收藏</Link>
            {user.role === "ADMIN" ? (
              <Link href="/admin">
                <ShieldIcon size={14} />
                管理后台
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="app-user">
          <div className="user-identity">
            <span className="avatar" aria-hidden="true">
              {initialOf(user.name)}
            </span>
            <span className="user-meta">
              <strong>{user.name}</strong>
              <span>@{user.username}</span>
            </span>
          </div>
          <form action={logoutAction} className="logout-form">
            <button type="submit" className="logout-button">
              <LogOutIcon size={15} />
              <span>退出</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
