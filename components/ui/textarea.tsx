"use client";

import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "textarea textarea-bordered w-full min-h-32",
        className,
      )}
      {...props}
    />
  );
}
