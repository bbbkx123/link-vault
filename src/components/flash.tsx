type NoticeTone = "success" | "error" | "info";

const notices: Record<string, { tone: NoticeTone; text: string }> = {
  created: { tone: "success", text: "新链接已经收进收藏夹。" },
  updated: { tone: "success", text: "这条收藏已经更新。" },
  deleted: { tone: "success", text: "收藏已删除。" },
  shared: {
    tone: "success",
    text: "公开主页已开启，链接现在可以分享了。",
  },
  unshared: {
    tone: "info",
    text: "公开主页已关闭，之前的分享链接将无法访问。",
  },
  invalid: { tone: "error", text: "提交的内容无效，请检查后重试。" },
  "not-found": {
    tone: "error",
    text: "没有找到这条收藏，可能已经被删除。",
  },
  "admin-only": {
    tone: "error",
    text: "这个页面只有管理员可以访问。",
  },
  "self-role": {
    tone: "error",
    text: "不能修改自己的角色，请让另一位管理员操作。",
  },
  "user-missing": {
    tone: "error",
    text: "没有找到这个用户。",
  },
  "role-updated": {
    tone: "success",
    text: "用户角色已经更新，将在对方下次进入页面时生效。",
  },
  "role-unchanged": {
    tone: "info",
    text: "角色没有变化，无需修改。",
  },
  "invalid-role": {
    tone: "error",
    text: "无效的角色操作。",
  },
};

export function Flash({ code }: { code?: string }) {
  if (!code) return null;
  const notice = notices[code];
  if (!notice) return null;

  return (
    <div
      className={`flash flash--${notice.tone}`}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      <span className="flash-mark" aria-hidden="true" />
      <span>{notice.text}</span>
    </div>
  );
}
