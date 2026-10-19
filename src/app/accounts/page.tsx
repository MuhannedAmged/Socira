"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconPlugConnected, IconTrash } from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS, platformById } from "@/config/platforms";
import { capabilityFor } from "@/lib/social/capabilities";

interface ConnectedAccount {
  id: string;
  platform: string;
  displayName: string;
  handle: string;
  status: string;
  scopes: string[];
}

/** SDK error codes surfaced by /api/social/callback, translated for humans. */
const OAUTH_ERRORS: Record<string, string> = {
  session_required: "Your session expired. Sign in, then start the connection again.",
  invalid_state: "The provider callback was missing or repeated its state value, so it was rejected.",
  unknown_attempt: "This connection attempt is unknown, expired, or already used. Start again.",
  unconfigured: "This platform is not configured on the server. See .env.example.",
  app_url_missing: "NEXT_PUBLIC_APP_URL is not set, so the callback URL cannot be registered.",
  cancelled: "You cancelled the authorization, or the platform denied it.",
  unauthorized: "The platform rejected the authorization request.",
  missing_permission: "The granted permissions are not enough for this platform's scopes.",
  reconnect_required: "The authorization is no longer valid. Start the connection again.",
  timeout: "The authorization request timed out. Start again.",
  rate_limited: "The platform rate limited the request. Try again in a moment.",
  upstream_failure: "The platform returned an error. Try again shortly.",
  oauth_failed: "OAuth did not complete. Start the connection again.",
};

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ConnectedAccount[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/accounts")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login?next=/accounts");
          return { accounts: [] };
        }
        return r.json();
      })
      .then((data) => setAccounts(Array.isArray(data.accounts) ? data.accounts : []))
      .catch(() => setAccounts([]));
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");
    if (!connected && !error) return;
    let message: string;
    if (connected) {
      const count = Number(connected);
      message = `Connected ${count} account${count === 1 ? "" : "s"}. Tokens are encrypted at rest.`;
    } else {
      message = OAUTH_ERRORS[error as string] ?? "OAuth did not complete. Start the connection again.";
    }
    window.history.replaceState(null, "", "/accounts");
    // Deferred one tick: the redirect result arrives outside React, and setting state
    // synchronously inside an effect would cascade renders before the first paint.
    const timer = window.setTimeout(() => setNotice(message), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function connect(platform: string) {
    setNotice(null);
    setBusy(platform);
    try {
      const res = await fetch(`/api/social/connect?platform=${encodeURIComponent(platform)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && typeof data.authorizationUrl === "string") {
        window.location.assign(data.authorizationUrl);
        return;
      }
      setNotice(data.error ?? "Could not start OAuth for this platform.");
    } catch {
      setNotice("Could not reach the server. Check your connection and try again.");
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

      <h2 className="mb-3 mt-8 text-sm font-semibold">Connect a platform</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => {
          const capability = capabilityFor(p.id);
          const connectable = capability?.oauth !== "unsupported";
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                    <p.icon className="size-5" aria-hidden />
                  </span>
                  <Badge variant={connectable ? "muted" : "warning"}>
                    {connectable ? "OAuth" : "Unavailable"}
                  </Badge>
                </div>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  {connectable
                    ? `${p.handleHint} · ${p.mediaNote}. Limits verified against the installed Social SDK.`
                    : capability?.notes}
                </CardDescription>
                <Button
                  variant="outline"
                  className="mt-1 w-full"
                  disabled={busy === p.id || !connectable}
                  onClick={() => connect(p.id)}
                >
                  {busy === p.id ? <IconLoader2 className="animate-spin" /> : <IconPlugConnected />}
                  Connect {p.name}
                </Button>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        OAuth needs developer credentials (see .env.example) and a callback URL registered at
        {" "}{"`<app>/api/social/callback`"}. Tokens are encrypted with AES-256-GCM before they reach the
        database, and platforms without a working adapter say so instead of failing silently.
      </p>
    </DashboardShell>
  );
}
