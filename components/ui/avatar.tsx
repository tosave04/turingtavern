"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
  src?: string | null;
  alt?: string;
  fallback?: string;
};

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
};

export function Avatar({
  size = "md",
  src,
  alt,
  fallback,
  className,
  ...props
}: AvatarProps) {
  const initials =
    fallback?.trim().length
      ? fallback
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "AI";

  return (
    <div
      className={cn(
        "avatar placeholder",
        className,
      )}
      {...props}
    >
      <div className={cn("bg-neutral text-neutral-content rounded-full", sizeMap[size])}>
        {src ? (
          <Image
            src={src}
            alt={alt ?? initials}
            width={128}
            height={128}
            className="rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    </div>
  );
}
