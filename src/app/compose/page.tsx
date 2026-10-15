"use client";

import { useMemo, useState } from "react";
import { IconSend, IconDeviceFloppy, IconAlertCircle } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/config/platforms";
import { cn } from "@/lib/utils";

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>(["x"]);
  const [status, setStatus] = useState<string | null>(null);

  const perPlatform = useMemo(
    () =>
      PLATFORMS.filter((p) => selected.includes(p.id)).map((p) => ({
        platform: p,
        over: content.length > p.charLimit,
        remaining: p.charLimit - content.length,
      })),
    [content, selected],
  );
  const blocked = perPlatform.some((p) => p.over);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function submit(publish: boolean) {
    setStatus(null);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, accountIds: selected, status: publish ? "publishing" : "draft" }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus(res.ok ? (publish ? "Publication recorded per destination." : "Draft saved.") : (data.error ?? "Something went wrong."));
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Compose"
        subtitle="Validated against each destination's real limits. Multi-platform posts must fit every selected destination."
      />
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
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={selected.includes(p.id)}
                  className={cn(
                    "pressable flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium",
                    selected.includes(p.id)
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  <p.icon className="size-4" aria-hidden /> {p.name}
                </button>
              ))}
            </div>
            {perPlatform.map(({ platform: p, over, remaining }) => (
              <p key={p.id} className={cn("tnum text-xs", over ? "text-destructive" : "text-muted-foreground")}>
                {over ? <IconAlertCircle className="mr-1 inline size-3.5" /> : null}
                {p.name}: {over ? `${Math.abs(remaining).toLocaleString()} over limit` : `${remaining.toLocaleString()} remaining`}
              </p>
            ))}
            {status ? <p className="text-[13px] text-muted-foreground" role="status">{status}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => submit(false)}><IconDeviceFloppy /> Save draft</Button>
              <Button disabled={blocked || !content || selected.length === 0} onClick={() => submit(true)}>
                <IconSend /> Publish now
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
    </DashboardShell>
  );
}
