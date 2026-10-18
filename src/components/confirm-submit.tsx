"use client";

import { useFormStatus } from "react-dom";

type ConfirmSubmitProps = {
  children: React.ReactNode;
  confirmMessage: string;
  className?: string;
  title?: string;
};

export function ConfirmSubmit({
  children,
  confirmMessage,
  className,
  title,
}: ConfirmSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      title={title}
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
