"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  name: string;
  email: string;
}

let cache: CurrentUser | null = null;
let inflight: Promise<CurrentUser | null> | null = null;
const listeners = new Set<(user: CurrentUser | null) => void>();

function publish(next: CurrentUser | null) {
  cache = next;
  for (const listener of listeners) listener(next);
}

function load(): Promise<CurrentUser | null> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) return null;
        const next = { name: data.user.name ?? "", email: data.user.email ?? "" };
        cache = next;
        return next;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Update the shared account snapshot (for example after saving a new name). */
export function setCurrentUser(next: CurrentUser | null) {
  publish(next);
}

/** The signed-in account, fetched once per page load and shared across components. */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(cache);

  useEffect(() => {
    listeners.add(setUser);
    let alive = true;
    load().then((next) => {
      if (!alive) return;
      if (next) publish(next);
    });
    return () => {
      alive = false;
      listeners.delete(setUser);
    };
  }, []);

  return user;
}

/** First character of the display name, falling back to the email, then "S". */
export function accountInitial(user: CurrentUser | null): string {
  const source = user?.name.trim() || user?.email.trim() || "S";
  return Array.from(source)[0]?.toUpperCase() ?? "S";
}
