"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingChildren?: React.ReactNode;
  className?: string;
  title?: string;
};

export function SubmitButton({
  children,
  pendingChildren = "处理中…",
  className = "btn btn-primary btn-sm",
  title,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending}
      title={title}
    >
      {pending ? pendingChildren : children}
    </button>
  );
}
