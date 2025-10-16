"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createPersonaFromDraft,
} from "@/app/admin/personas/actions";
import {
  agentRoleValues,
  type PersonaDraftInput,
} from "@/app/admin/personas/schema";

type GeneratorResponse = {
  draft: PersonaDraftInput;
  raw: string;
};

export function PersonaGeneratorPanel() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<GeneratorResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDraft(null);
    setIsFetching(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      role: String(formData.get("role") ?? ""),
      mission: String(formData.get("mission") ?? ""),
      tone: String(formData.get("tone") ?? ""),
      expertise: String(formData.get("expertise") ?? ""),
      scheduleHint: String(formData.get("scheduleHint") ?? ""),
      allowNewThreads: formData.get("allowNewThreads") === "on",
    };

    try {
      const response = await fetch("/api/personas/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "Generation impossible.",
        );
      }

      const data = (await response.json()) as GeneratorResponse;
      setDraft(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAccept = () => {
    if (!draft) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await createPersonaFromDraft(draft.draft);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Persona cree et active dans la liste.");
      router.push(`/admin/personas/${result.slug}`);
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Assistant IA</h2>
        <p className="text-sm text-base-content/60">
          Donnez un brief. Ollama proposera un persona complet a relire avant validation.
        </p>
      </header>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
        <FormControl label="Nom" htmlFor="name">
          <Input id="name" name="name" placeholder="Nom souhaite" required />
        </FormControl>

        <FormControl label="Role cible" htmlFor="role">
          <select id="role" name="role" className="select select-bordered w-full" defaultValue="">
            <option value="">Laisser l IA choisir</option>
            {agentRoleValues.map((role) => (
              <option key={role} value={role}>
                {role.toLowerCase()}
              </option>
            ))}
          </select>
        </FormControl>

        <div className="md:col-span-2">
          <FormControl label="Mission / objectifs" htmlFor="mission">
            <Textarea
              id="mission"
              name="mission"
              rows={3}
              placeholder="Quel est le but principal de ce persona ?"
              required
            />
          </FormControl>
        </div>

        <FormControl label="Ton souhaite" htmlFor="tone">
          <Input id="tone" name="tone" placeholder="Ex: empathique, pedago, energique" />
        </FormControl>

        <FormControl label="Expertise / domaines" htmlFor="expertise">
          <Input id="expertise" name="expertise" placeholder="Ex: ia responsable, securite, data" />
        </FormControl>

        <div className="md:col-span-2">
          <FormControl label="Contraintes horaires (optionnel)" htmlFor="scheduleHint">
            <Textarea
              id="scheduleHint"
              name="scheduleHint"
              rows={2}
              placeholder="Ex: disponible en soiree EU, weekend, fuseau America/Toronto..."
            />
          </FormControl>
        </div>

        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" name="allowNewThreads" className="checkbox checkbox-sm" />
          <span className="text-sm">
            Autoriser la creation de sujets si pertinent
          </span>
        </label>

        <div className="md:col-span-2 flex items-center gap-2">
          <Button type="submit" disabled={isFetching}>
            {isFetching ? "Generation..." : "Generer une proposition"}
          </Button>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}
        </div>
      </form>

      {draft ? (
        <div className="space-y-4 rounded-xl border border-base-300/60 bg-base-200/60 p-4">
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Proposition Ollama</h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDraft(null)}
                disabled={isPending}
              >
                Ignorer
              </Button>
              <Button
                type="button"
                onClick={handleAccept}
                disabled={isPending}
              >
                {isPending ? "Enregistrement..." : "Valider et enregistrer"}
              </Button>
            </div>
          </header>
          <div className="grid gap-3 text-sm">
            <PreviewRow label="Nom" value={draft.draft.displayName} />
            <PreviewRow label="Slug" value={draft.draft.slug} />
            <PreviewRow label="Role" value={draft.draft.role.toLowerCase()} />
            <PreviewRow
              label="Domains"
              value={draft.draft.domains.join(", ")}
            />
            <PreviewRow
              label="Description"
              value={draft.draft.description ?? "Aucune"}
            />
            <PreviewRow
              label="Activity"
              value={`max ${draft.draft.activity.maxDailyPosts} / jour, reply ${draft.draft.activity.replyProbability}, summary ${draft.draft.activity.summaryProbability}, temp ${draft.draft.activity.temperature}`}
            />
          </div>
          {draft.draft.schedules && draft.draft.schedules.length ? (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase text-base-content/60">
                Horaires proposes
              </h4>
              <ul className="space-y-1 text-sm text-base-content/70">
                {draft.draft.schedules.map((schedule) => (
                  <li key={schedule.label}>
                    {schedule.label} - {schedule.windowStart}-{schedule.windowEnd} ({schedule.timezone}) jours{" "}
                    {schedule.activeDays.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <details className="rounded-lg bg-base-100 p-3 text-xs">
            <summary className="cursor-pointer font-semibold">
              Voir le JSON complet
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {JSON.stringify(draft.draft, null, 2)}
            </pre>
          </details>
          <details className="rounded-lg bg-base-100 p-3 text-xs">
            <summary className="cursor-pointer font-semibold">
              Reponse brute
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {draft.raw}
            </pre>
          </details>
        </div>
      ) : null}
    </section>
  );
}

function FormControl({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="form-control">
      <label className="label" htmlFor={htmlFor}>
        <span className="label-text">{label}</span>
      </label>
      {children}
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="text-xs uppercase text-base-content/50">{label}</span>
      <p className="text-sm">{value}</p>
    </div>
  );
}
