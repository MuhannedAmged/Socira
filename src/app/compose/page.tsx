"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconSend, IconDeviceFloppy, IconAlertCircle, IconLoader2, IconPlugConnected } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PLATFORMS, platformById } from "@/config/platforms";
import { cn } from "@/lib/utils";

interface ConnectedAccount {
  id: string;
  platform: string;
  displayName: string;
  handle: string;
  status: string;
}

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [accounts, setAccounts] = useState<ConnectedAccount[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: ConnectedAccount[] = Array.isArray(data.accounts) ? data.accounts : [];
        setAccounts(list);
        setSelected(list.filter((a) => a.status === "connected").map((a) => a.id));
      })
      .catch(() => {
        if (!cancelled) setAccounts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlatforms = useMemo(
    () =>
      selected
        .map((id) => accounts?.find((a) => a.id === id)?.platform)
        .filter((p): p is string => Boolean(p)),
    [selected, accounts],
  );

  const perPlatform = useMemo(
    () =>
      PLATFORMS.filter((p) => selectedPlatforms.includes(p.id)).map((p) => ({
        platform: p,
        over: content.length > p.charLimit,
        remaining: p.charLimit - content.length,
      })),
    [content, selectedPlatforms],
  );
  const blocked = perPlatform.some((p) => p.over);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function submit(publish: boolean) {
    setStatus(null);
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, accountIds: selected, status: publish ? "publishing" : "draft" }),
      });
      const data = await res.json().catch(() => ({}));
      setStatus(res.ok ? (publish ? "Publication recorded per destination." : "Draft saved.") : (data.error ?? "Something went wrong."));
      if (res.ok && publish) setContent("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Compose"
        subtitle="Validated against each destination's real limits. Multi-platform posts must fit every selected destination."
      />
      {accounts === null ? (
        <Card>
          <CardContent className="flex items-center gap-2 pt-5 text-sm text-muted-foreground">
            <IconLoader2 className="animate-spin" /> Loading your connected accounts…
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<IconPlugConnected />}
          title="Connect an account first"
          description="The composer targets your connected SocialAccounts — not platform names. Connect Instagram, Facebook, YouTube, LinkedIn, TikTok or X to start."
          action={<Link href="/accounts"><Button>Connect accounts</Button></Link>}
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader><CardTitle>Content</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Write once, adapt per platform…"
                className="w-full rounded-xl border border-input bg-background p-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:border-ring"
              />
              <div className="flex flex-wrap gap-2">
                {accounts.map((a) => {
                  const meta = platformById(a.platform);
                  const active = selected.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggle(a.id)}
                      aria-pressed={active}
                      title={a.handle || a.displayName || a.platform}
                      className={cn(
                        "pressable flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium",
                        active
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {meta ? <meta.icon className="size-4" aria-hidden /> : null}
                      {a.handle || a.displayName || meta?.name || a.platform}
                      {a.status !== "connected" ? " · reconnect" : ""}
                    </button>
                  );
                })}
              </div>
              {perPlatform.map(({ platform: p, over, remaining }) => (
                <p key={p.id} className={cn("tnum text-xs", over ? "text-destructive" : "text-muted-foreground")}>
                  {over ? <IconAlertCircle className="mr-1 inline size-3.5" /> : null}
                  {p.name}: {over ? `${Math.abs(remaining).toLocaleString()} over limit` : `${remaining.toLocaleString()} remaining`}
                </p>
              ))}
              {status ? <p className="text-[13px] text-muted-foreground" role="status">{status}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={saving || !content || selected.length === 0} onClick={() => submit(false)}>
                  <IconDeviceFloppy /> Save draft
                </Button>
                <Button disabled={saving || blocked || !content || selected.length === 0} onClick={() => submit(true)}>
                  {saving ? <IconLoader2 className="animate-spin" /> : <IconSend />} Publish now
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Capability notes</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-[13px] leading-5 text-muted-foreground">
              <Badge variant="warning">Scheduling gated</Badge>
              <p>
                “Schedule” appears only when native scheduling (YouTube where supported) or a
                configured hosting cron exists. Otherwise dates are saved as planned — see
                docs/SCHEDULING.md.
              </p>
              <p>Publishing uses idempotency keys and records per-destination outcomes. Ambiguous results reconcile before retry.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
