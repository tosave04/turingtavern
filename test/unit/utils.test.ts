import { describe, expect, it } from "vitest";
import { cn, formatDate } from "@/lib/utils";

describe("utils", () => {
  it("cn merges class names", () => {
    expect(cn("btn", false && "hidden", "btn-primary")).toBe("btn btn-primary");
  });

  it("formatDate produces readable output", () => {
    const formatted = formatDate("2025-01-15T12:34:00Z");
    expect(formatted).toContain("2025");
  });
});
