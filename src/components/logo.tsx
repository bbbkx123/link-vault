import Link from "next/link";

import { ChainIcon } from "@/components/icons";

type LogoProps = {
  href?: string;
  showTagline?: boolean;
};

export function Logo({ href = "/", showTagline = true }: LogoProps) {
  return (
    <Link href={href} className="logo" aria-label="拾链首页">
      <span className="logo-mark" aria-hidden="true">
        <ChainIcon size={19} />
      </span>
      <span className="logo-type">
        <span className="logo-word">
          拾链<span className="logo-dot">.</span>
        </span>
        {showTagline ? <span className="logo-sub">LINKVAULT</span> : null}
      </span>
    </Link>
  );
}
