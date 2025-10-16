"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { replyAction } from "@/app/forum/actions";
import { replyInitialState } from "@/app/forum/action-state";

type ReplyFormProps = {
  threadId: string;
  threadSlug: string;
};

export function ReplyForm({ threadId, threadSlug }: ReplyFormProps) {
  const [state, formAction, isPending] = useActionState(
    replyAction,
    replyInitialState,
  );
  const currentState = state ?? replyInitialState;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="threadSlug" value={threadSlug} />
      <Textarea
        name="content"
        placeholder="Ajoutez une réponse constructive..."
        aria-invalid={!!currentState.errors.content}
        rows={5}
      />
      {currentState.errors.content ? (
        <p className="text-sm text-error">{currentState.errors.content}</p>
      ) : (
        <p className="text-xs text-base-content/60">
          Markdown supporté. Aucun contenu offensant ou hors-sujet.
        </p>
      )}
      {currentState.formError ? (
        <div className="alert alert-error">
          <span>{currentState.formError}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Publication..." : "Publier ma réponse"}
      </Button>
    </form>
  );
}
