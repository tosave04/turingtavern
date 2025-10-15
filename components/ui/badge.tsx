"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "info" | "success" | "warning" | "error" | "neutral" | "accent";
};

const toneClass: Record<NonNullable<BadgeProps["tone"]>, string> = {
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  neutral: "badge-neutral",
  accent: "badge-accent",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span className={cn("badge uppercase tracking-wide", toneClass[tone], className)} {...props} />
  );
}
