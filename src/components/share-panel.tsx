import Link from "next/link";

import { setShareVisibilityAction } from "@/actions/share";
import { CopyButton } from "@/components/copy-button";
import { ArrowUpRightIcon, LockIcon, GlobeIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";

type SharePanelProps = {
  isPublic: boolean;
  username: string;
};

export function SharePanel({ isPublic, username }: SharePanelProps) {
  const sharePath = `/u/${username}`;

  return (
    <section className="share-bar" aria-label="公开分享设置">
      <div className="share-info">
        <span
          className={`share-icon ${isPublic ? "is-public" : ""}`}
          aria-hidden="true"
        >
          {isPublic ? <GlobeIcon size={17} /> : <LockIcon size={16} />}
        </span>
        <div>
          <strong>
            {isPublic ? "公开主页已开启" : "收藏夹目前仅自己可见"}
          </strong>
          <p>
            {isPublic
              ? `任何拿到链接的人都能访问 ${sharePath}，但看不到你的邮箱。`
              : "开启后，可以把链接和标签展示在只读的公开主页上。"}
          </p>
        </div>
      </div>

      <div className="share-actions">
        {isPublic ? (
          <>
            <CopyButton path={sharePath} />
            <Link
              href={sharePath}
              target="_blank"
              className="btn btn-ghost btn-sm"
            >
              查看主页
              <ArrowUpRightIcon size={14} />
            </Link>
            <form action={setShareVisibilityAction}>
              <input type="hidden" name="isPublic" value="false" />
              <SubmitButton
                className="btn btn-ghost btn-sm"
                pendingChildren="关闭中…"
              >
                停止公开
              </SubmitButton>
            </form>
          </>
        ) : (
          <form action={setShareVisibilityAction}>
            <input type="hidden" name="isPublic" value="true" />
            <SubmitButton
              className="btn btn-primary btn-sm"
              pendingChildren="开启中…"
            >
              <GlobeIcon size={14} />
              开启分享
            </SubmitButton>
          </form>
        )}
      </div>
    </section>
  );
}
