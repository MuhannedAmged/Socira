"use client";

import { useEffect, useState } from "react";

/** True when the primary input cannot hover (touch). Gate hover-only effects. */
export function useHoverCapable() {
  const [capable, setCapable] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setCapable(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return capable;
}
