import Link from "next/link";
import { IconHexagonFilled } from "@tabler/icons-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 font-bold">
            <IconHexagonFilled className="size-5" aria-hidden /> Socira
          </span>
          <p className="max-w-xs text-[13px] leading-5 text-muted-foreground">
            Open-source social media management. Your accounts, your data, your infrastructure.
          </p>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Product</p>
          <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
            <li><Link className="hover:text-foreground" href="#platforms">Platforms</Link></li>
            <li><Link className="hover:text-foreground" href="#features">Features</Link></li>
            <li><Link className="hover:text-foreground" href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Resources</p>
          <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/docs">Documentation</Link></li>
            <li><Link className="hover:text-foreground" href="https://github.com/MuhannedAmged/Socira">GitHub</Link></li>
            <li><Link className="hover:text-foreground" href="#security">Security</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Legal</p>
          <ul className="flex flex-col gap-2 text-[13px] text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/privacy">Privacy</Link></li>
            <li><Link className="hover:text-foreground" href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="tnum mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Socira is open source under the MIT License. No premium tiers, no paywalls.
        </p>
      </div>
    </footer>
  );
}
