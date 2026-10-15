import Link from "next/link";
import { IconHexagonFilled } from "@tabler/icons-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <IconHexagonFilled className="size-6" aria-hidden /> Socira
        </Link>
        <div>
          <p className="max-w-md text-3xl font-bold tracking-tight text-balance">
            One workspace for Instagram, Facebook, YouTube, LinkedIn, TikTok and X.
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 opacity-70">
            Real publishing, honest scheduling, encrypted credentials, and analytics that only
            show what platforms actually return.
          </p>
        </div>
        <p className="text-xs opacity-60">Open source · MIT · No premium tiers</p>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 font-bold lg:hidden">
            <IconHexagonFilled className="size-6" aria-hidden /> Socira
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
