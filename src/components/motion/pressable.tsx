"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

/* Feel: tactile press — scale to 0.96 on tap. Disabled via `static` prop when distracting. */

export function Pressable({
  children,
  className,
  ...props
}: React.ComponentProps<typeof motion.button> & { static?: boolean }) {
  const reduce = useReducedMotion();
  const { static: _static, ...rest } = props as Record<string, unknown>;
  void _static;
  return (
    <motion.button
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={reduce ? { duration: 0 } : SPRING_PRESS}
      className={cn(className as string)}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
