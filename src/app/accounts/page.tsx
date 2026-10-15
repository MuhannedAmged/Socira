"use client";

import { useCallback, useEffect, useState } from "react";
import { IconLoader2, IconPlugConnected, IconTrash } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS, platformById } from "@/config/platforms";

interface ConnectedAccount {
  id: string;
  platform: string;
  displayName: string;
  handle: string;
  status: string;
  scopes: string[];
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<ConnectedAccount[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(Array.isArray(data.accounts) ? data.accounts : []))
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function connect(platform: string) {
    setNotice(null);
    setBusy(platform);
    try {
      const res = await fetch(`/api/social/connect?platform=${encodeURIComponent(platform)}`);
      const data = await res.json().catch(() => ({}));
      setNotice(data.error ?? data.message ?? "Done.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(id: string) {
    setNotice(null);
    setBusy(id);
    try {
      const res = await fetch("/api/accounts", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error ?? "Could not disconnect.");
        return;
      }
      setNotice("Local connection removed.");
      load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Connected accounts"
        subtitle="Six supported platforms. Connections use server-side OAuth with secure state and encrypted credential storage."
      />
      {notice ? (
        <p className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-[13px] leading-5" role="status">
          {notice}
        </p>
      ) : null}

      <h2 className="mb-2 text-sm font-semibold">Your connections</h2>
      {accounts === null ? (
        <Card>
          <CardContent className="flex items-center gap-2 pt-5 text-sm text-muted-foreground">
            <IconLoader2 className="animate-spin" /> Loading…
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground">
            Nothing connected yet. Start an OAuth connection below.
          </CardContent>
        </Card>
      ) : (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const meta = platformById(a.platform);
            return (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      {meta ? <meta.icon className="size-5" aria-hidden /> : null}
                    </span>
                    <Badge variant={a.status === "connected" ? "success" : "warning"}>{a.status}</Badge>
                  </div>
                  <CardTitle>{a.displayName || a.handle || meta?.name || a.platform}</CardTitle>
                  <CardDescription>
                    {[meta?.name, a.handle].filter(Boolean).join(" · ")}
                    {a.scopes.length > 0 ? ` · ${a.scopes.length} scope${a.scopes.length === 1 ? "" : "s"}` : ""}
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="mt-1 w-full"
                    disabled={busy === a.id}
                    onClick={() => disconnect(a.id)}
                  >
                    {busy === a.id ? <IconLoader2 className="animate-spin" /> : <IconTrash />}
                    Disconnect
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <h2 className="mb-2 text-sm font-semibold">Connect a platform</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <p.icon className="size-5" aria-hidden />
                </span>
                <Badge variant="muted">OAuth</Badge>
              </div>
              <CardTitle>{p.name}</CardTitle>
              <CardDescription>
                {p.handleHint} · {p.mediaNote}. Limits verified against the installed Social SDK.
              </CardDescription>
              <Button
                variant="outline"
                className="mt-1 w-full"
                disabled={busy === p.id}
                onClick={() => connect(p.id)}
              >
                {busy === p.id ? <IconLoader2 className="animate-spin" /> : <IconPlugConnected />}
                Connect {p.name}
              </Button>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        OAuth requires developer credentials (see .env.example) and a registered callback URL.
        Without configuration, connections state exactly what is missing instead of failing silently.
      </p>
    </DashboardShell>
  );
}
