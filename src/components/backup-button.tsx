"use client";

import { useState } from "react";

import { exportCollectionBackupAction } from "@/actions/backup";
import { DownloadIcon } from "@/components/icons";

type Status = { tone: "success" | "error"; message: string } | null;

export function BackupButton() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleExport() {
    if (pending) return;

    setPending(true);
    setStatus(null);

    try {
      const result = await exportCollectionBackupAction();
      if (!result.ok) {
        setStatus({ tone: "error", message: result.message });
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = result.url;
      anchor.download = result.fileName;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setStatus({
        tone: "success",
        message: `${result.count} 条收藏已导出`,
      });
    } catch {
      setStatus({
        tone: "error",
        message: "备份生成失败，请稍后再试。",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="backup-action">
      <button
        type="button"
        className="btn btn-ghost"
        onClick={handleExport}
        disabled={pending}
        aria-busy={pending}
        title="将全部收藏导出为 JSON，保存到 Neon Object Storage"
      >
        <DownloadIcon size={16} />
        {pending ? "生成备份中…" : "导出备份"}
      </button>
      {status ? (
        <span
          className={`backup-status backup-status--${status.tone}`}
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.message}
        </span>
      ) : null}
    </div>
  );
}
