"use client";

import { useTheme } from "@/components/theme-provider";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/* Cross-fade icon swap: scale 0.25→1, opacity 0→1, blur 4px→0px per skill. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute transition-[scale,opacity,filter] duration-200"
        style={{
          scale: dark ? "0.25" : "1",
          opacity: dark ? 0 : 1,
          filter: dark ? "blur(4px)" : "blur(0px)",
        }}
      >
        <IconSun className="size-4" />
      </span>
      <span
        aria-hidden
        className="absolute transition-[scale,opacity,filter] duration-200"
        style={{
          scale: dark ? "1" : "0.25",
          opacity: dark ? 1 : 0,
          filter: dark ? "blur(0px)" : "blur(4px)",
        }}
      >
        <IconMoon className="size-4" />
      </span>
    </Button>
  );
}
