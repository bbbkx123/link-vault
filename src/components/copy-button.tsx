"use client";

import { useEffect, useRef, useState } from "react";

import { CheckIcon, CopyIcon } from "@/components/icons";

type CopyButtonProps = {
  path: string;
};

export function CopyButton({ path }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      const url = new URL(path, window.location.origin).toString();
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), 2400);
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      onClick={handleCopy}
      aria-live="polite"
    >
      {status === "copied" ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
      {status === "copied"
        ? "已复制"
        : status === "error"
          ? "复制失败"
          : "复制链接"}
    </button>
  );
}
