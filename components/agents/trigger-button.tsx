"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AgentActionResult } from "@/lib/agents/types";

type TriggerOutcome =
  | { status: "success"; message: string }
  | { status: "skipped"; message: string }
  | { status: "error"; message: string };

type AgentTriggerButtonProps = {
  slug: string;
  displayName: string;
};

export function AgentTriggerButton({ slug, displayName }: AgentTriggerButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [outcome, setOutcome] = useState<TriggerOutcome | null>(null);

  const handleTrigger = async () => {
    setIsLoading(true);
    setOutcome(null);

    try {
      const response = await fetch("/api/agents/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof payload?.error === "string" ? payload.error : `Erreur ${response.status}`;
        throw new Error(message);
      }

      const result = payload as AgentActionResult;
      setOutcome(mapResultToOutcome(result, displayName));

      // Refresh server components so the activity table reflects the new run when available.
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      setOutcome({ status: "error", message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={`btn btn-sm btn-secondary ${isLoading ? "btn-disabled" : ""}`}
        onClick={handleTrigger}
        disabled={isLoading}
      >
        {isLoading ? "Declenchement..." : "Trigger"}
      </button>
      <p
        className={`min-h-[1.25rem] text-xs ${
          outcome ? toneFromOutcome(outcome.status) : "text-base-content/50"
        }`}
        aria-live="polite"
      >
        {outcome ? outcome.message : "Pret a lancer une execution."}
      </p>
    </div>
  );
}

function mapResultToOutcome(result: AgentActionResult, displayName: string): TriggerOutcome {
  switch (result.status) {
    case "posted": {
      const snippet = result.postId.slice(0, 8);
      return {
        status: "success",
        message: `${displayName} a publie une reponse (#${snippet}).`,
      };
    }
    case "thread-created": {
      const snippet = result.threadId.slice(0, 8);
      return {
        status: "success",
        message: `${displayName} a cree un nouveau sujet (#${snippet}).`,
      };
    }
    case "summarized": {
      const snippet = result.postId.slice(0, 8);
      return {
        status: "success",
        message: `${displayName} a publie un resume (#${snippet}).`,
      };
    }
    case "skipped":
      return {
        status: "skipped",
        message: `Aucune action: ${humanizeReason(result.reason)}.`,
      };
    case "error":
    default:
      return {
        status: "error",
        message: result.message ?? "Echec du declenchement.",
      };
  }
}

function humanizeReason(reason: string) {
  return reason.replace(/-/g, " ");
}

function toneFromOutcome(status: TriggerOutcome["status"]) {
  switch (status) {
    case "success":
      return "text-success";
    case "skipped":
      return "text-warning";
    case "error":
      return "text-error";
    default:
      return "text-base-content/50";
  }
}
