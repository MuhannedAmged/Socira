"use client";

import { useSyncExternalStore } from "react";

/*
 * Sidebar collapsed state persisted to localStorage.
 *
 * Why an external store instead of useState(initializer)?
 * A lazy initializer reading localStorage returns "collapsed" on the first
 * client render while the server rendered "expanded" -> hydration mismatch
 * (and the toggle appears broken). useSyncExternalStore renders the server
 * snapshot ("expanded") during hydration, then re-renders with the stored
 * value - the sanctioned, mismatch-free pattern.
 */

const KEY = "socira:sidebar";

let current = false;
const listeners = new Set<() => void>();

function readStored(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "collapsed";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): boolean {
  return current;
}

function getServerSnapshot(): boolean {
  return false;
}

// Sync module state with storage once, on the client only.
if (typeof window !== "undefined") {
  current = readStored();
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setSidebarCollapsed(next: boolean | ((prev: boolean) => boolean)): void {
  const value = typeof next === "function" ? next(current) : next;
  current = value;
  try {
    window.localStorage.setItem(KEY, value ? "collapsed" : "expanded");
  } catch {
    // Storage unavailable (private mode) - state still works for the session.
  }
  listeners.forEach((listener) => listener());
}
