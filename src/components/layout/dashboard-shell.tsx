"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBell,
  IconCalendar,
  IconChartBar,
  IconHexagonFilled,
  IconHome,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconPhoto,
  IconPlus,
  IconArticle,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed, setSidebarCollapsed } from "@/lib/hooks/use-sidebar-state";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: IconHome },
  { href: "/accounts", label: "Accounts", icon: IconUsers },
  { href: "/compose", label: "Compose", icon: IconPlus },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/posts", label: "Posts", icon: IconArticle },
  { href: "/media", label: "Media", icon: IconPhoto },
  { href: "/analytics", label: "Analytics", icon: IconChartBar },
  { href: "/inbox", label: "Inbox", icon: IconInbox },
  { href: "/notifications", label: "Notifications", icon: IconBell },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const collapsed = useSidebarCollapsed();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar — desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <IconHexagonFilled className="size-6 shrink-0" aria-hidden />
            {!collapsed && <span className="text-[16px] tracking-tight">Socira</span>}
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Dashboard">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pressable flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 border-t border-border p-3">
          {!collapsed && <ThemeToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IconLayoutSidebarLeftCollapse className="size-4" />
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6">
          <Link href="/compose" className="md:hidden">
            <Button size="sm">
              <IconPlus /> New post
            </Button>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Local workspace
            </span>
            <Link href="/notifications" aria-label="Notifications">
              <Button variant="ghost" size="icon">
                <IconBell />
              </Button>
            </Link>
            <Link href="/settings" aria-label="Profile settings">
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                S
              </span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>

        {/* Mobile nav */}
        <nav
          className="sticky bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-border bg-card px-2 py-2 md:hidden"
          aria-label="Mobile"
        >
          {NAV.slice(0, 5).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
