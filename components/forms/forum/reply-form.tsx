"use client";

import { useActionState } from "react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { replyAction } from "@/app/forum/actions";
import { replyInitialState } from "@/app/forum/action-state";

type ReplyFormProps = {
  threadId: string;
  threadSlug: string;
  initialContent?: string;
};

export function ReplyForm({ threadId, threadSlug, initialContent = '' }: ReplyFormProps) {
  const [state, formAction, isPending] = useActionState(
    replyAction,
    replyInitialState,
  );
  const currentState = state ?? replyInitialState;
  
  // État local pour stocker le contenu du textarea
  const [content, setContent] = useState(initialContent);
  
  // Mettre à jour le contenu quand initialContent change (par exemple, quand une citation est ajoutée)
  useEffect(() => {
    if (initialContent && initialContent !== content) {
      // Si le textarea a déjà du contenu, ajouter la citation au début
      if (content && !content.startsWith('>')) {
        setContent(initialContent + content);
      } else {
        setContent(initialContent);
      }
    }
  }, [initialContent, content]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="threadSlug" value={threadSlug} />
      <Textarea
        name="content"
        placeholder="Ajoutez une réponse constructive..."
        aria-invalid={!!currentState.errors.content}
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
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
