"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  IconBell,
  IconCheck,
  IconLoader2,
  IconLogout,
  IconMailForward,
  IconPalette,
  IconShieldLock,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme, type Theme } from "@/components/theme-provider";
import { setCurrentUser } from "@/lib/hooks/use-current-user";
import { cn } from "@/lib/utils";

interface Me {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  theme: Theme;
  timezone: string;
  preferences: { emailOnPublish: boolean; emailOnFailure: boolean };
  createdAt: string;
}

const TIMEZONES = [
  "UTC",
  "Africa/Cairo",
  "Africa/Lagos",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Paris",
];

const THEMES: { id: Theme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

function SectionTitle({ icon: Icon, children }: { icon: typeof IconUser; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold">
      <Icon className="size-4 text-muted-foreground" aria-hidden />
      {children}
    </span>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  const load = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login?next=/settings");
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((data) => {
        if (!data?.user) return;
        const u: Me = data.user;
        setMe(u);
        setName(u.name);
        setTimezone(u.timezone);
        if (u.theme !== theme) setTheme(u.theme);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: Record<string, unknown>, successText: string) {
    setNotice(null);
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ ok: false, text: data.error ?? "Could not save changes." });
        return;
      }
      setMe(data.user);
      setCurrentUser({ name: data.user.name, email: data.user.email });
      setNotice({ ok: true, text: successText });
    } finally {
      setSaving(false);
    }
  }

  function pickTheme(next: Theme) {
    setTheme(next);
    void patch({ theme: next }, "Appearance saved.");
  }

  async function sendResetLink() {
    if (!me) return;
    setNotice(null);
    const res = await fetch("/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: me.email }),
    });
    setNotice(
      res.ok
        ? { ok: true, text: `Reset link sent to ${me.email}. It expires in 30 minutes.` }
        : { ok: false, text: "Could not send the reset link. Try again." },
    );
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function deleteWorkspace() {
    setNotice(null);
    const res = await fetch("/api/auth/me", { method: "DELETE" });
    if (!res.ok) {
      setNotice({ ok: false, text: "Could not delete the workspace." });
      return;
    }
    router.push("/");
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Settings"
        subtitle="Profile, appearance, notifications, security, and danger zone. Every change saves for real."
      />
      {notice ? (
        <p
          role="status"
          className={cn(
            "mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-[13px]",
            notice.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
          )}
        >
          {notice.ok ? <IconCheck className="size-4 shrink-0" aria-hidden /> : null}
          {notice.text}
        </p>
      ) : null}

      {!me ? (
        <Card>
          <CardContent className="flex items-center gap-2 pt-5 text-sm text-muted-foreground">
            <IconLoader2 className="animate-spin" /> Loading your settings…
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Profile */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IconUser}>Profile</SectionTitle>
              <CardDescription>Name and timezone used across the calendar and scheduling.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tz">Timezone</Label>
                <Input
                  id="tz"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  list="tz-list"
                  placeholder="UTC"
                />
                <datalist id="tz-list">
                  {TIMEZONES.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </div>
              <div>
                <Button disabled={saving} onClick={() => patch({ name, timezone }, "Profile saved.")}>
                  {saving ? <IconLoader2 className="animate-spin" /> : null} Save changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IconPalette}>Appearance</SectionTitle>
              <CardDescription>Theme applies instantly and syncs to your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Theme">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={theme === t.id}
                    onClick={() => pickTheme(t.id)}
                    className={cn(
                      "pressable rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      theme === t.id
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IconBell}>Notifications</SectionTitle>
              <CardDescription>Transactional email preferences. In-app notifications are always on.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {(
                [
                  { key: "emailOnPublish", label: "Publishing results", hint: "Email me when a post publishes or partially succeeds." },
                  { key: "emailOnFailure", label: "Failures & reconnection", hint: "Email me when publishing fails or a token needs reconnecting." },
                ] as const
              ).map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3">
                  <span>
                    <span className="block text-sm font-medium">{row.label}</span>
                    <span className="block text-xs leading-5 text-muted-foreground">{row.hint}</span>
                  </span>
                  <Switch
                    label={row.label}
                    checked={me.preferences[row.key]}
                    onCheckedChange={(next) => {
                      const preferences = { ...me.preferences, [row.key]: next };
                      setMe({ ...me, preferences });
                      void patch({ preferences }, "Notification preferences saved.");
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IconMailForward}>Account</SectionTitle>
              <CardDescription>Signed-in identity. Email changes are not supported.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{me.email}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={me.emailVerified ? "success" : "warning"}>
                  {me.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Member since</span>
                <span className="tnum font-medium">
                  {new Date(me.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IconShieldLock}>Security</SectionTitle>
              <CardDescription>Password and sessions. Reset links are single-use and expire in 30 minutes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={sendResetLink}>
                <IconMailForward /> Email password reset
              </Button>
              <Button variant="outline" onClick={signOut}>
                <IconLogout /> Sign out
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/40">
            <CardHeader>
              <SectionTitle icon={IconTrash}>Danger zone</SectionTitle>
              <CardDescription>
                Deletes your account, social connections, credentials, posts, media, and
                notifications. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
                <Input
                  id="confirm-delete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <div>
                <Button
                  variant="destructive"
                  disabled={confirmDelete.trim() !== "DELETE"}
                  onClick={deleteWorkspace}
                >
                  <IconTrash /> Delete workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
