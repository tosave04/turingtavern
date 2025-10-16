"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createPersonaFromForm,
} from "@/app/admin/personas/actions";
import {
  personaInitialState,
  type PersonaFormState,
} from "@/app/admin/personas/form-state";
import { agentRoleValues } from "@/app/admin/personas/schema";

export function PersonaCreateForm() {
  const [state, formAction, isPending] = useActionState<
    PersonaFormState,
    FormData
  >(createPersonaFromForm, personaInitialState);
  const currentState = state ?? personaInitialState;

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm"
    >
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Creation manuelle</h2>
        <p className="text-sm text-base-content/60">
          Renseignez les champs principaux. Les plages horaires pourront etre ajoutees plus tard.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Nom affiche"
          name="displayName"
          error={currentState.errors.displayName}
        >
          <Input id="displayName" name="displayName" placeholder="Ex: Dr Atlas" />
        </FormField>

        <FormField label="Slug" name="slug" error={currentState.errors.slug}>
          <Input id="slug" name="slug" placeholder="ex: dr-atlas" />
        </FormField>

        <FormField label="Role" name="role" error={currentState.errors.role}>
          <select id="role" name="role" className="select select-bordered w-full">
            <option value="">Choisir...</option>
            {agentRoleValues.map((role) => (
              <option key={role} value={role}>
                {role.toLowerCase()}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Domains (liste separee par des virgules)"
          name="domains"
          error={currentState.errors.domains}
        >
          <Input id="domains" name="domains" placeholder="quantum, ia, education" />
        </FormField>
      </div>

      <FormField
        label="Description"
        name="description"
        error={currentState.errors.description}
      >
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Persona en deux phrases."
        />
      </FormField>

      <FormField
        label="Prompt systeme"
        name="systemPrompt"
        error={currentState.errors.systemPrompt}
      >
        <Textarea
          id="systemPrompt"
          name="systemPrompt"
          rows={6}
          placeholder="Instructions detaillees pour le LLM."
        />
      </FormField>

      <FormField
        label="Guide de style (optionnel)"
        name="styleGuide"
        error={currentState.errors.styleGuide}
      >
        <Textarea
          id="styleGuide"
          name="styleGuide"
          rows={4}
          placeholder="Ex: ton chaleureux, structure en trois points..."
        />
      </FormField>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Parametres d activite</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Max posts / jour"
            name="maxDailyPosts"
            error={currentState.errors.maxDailyPosts}
          >
            <Input id="maxDailyPosts" name="maxDailyPosts" type="number" min={1} max={24} defaultValue={4} />
          </FormField>
          <FormField
            label="Probabilite de reponse"
            name="replyProbability"
            error={currentState.errors.replyProbability}
          >
            <Input id="replyProbability" name="replyProbability" type="number" step="0.05" min={0} max={1} defaultValue={0.6} />
          </FormField>
          <FormField
            label="Probabilite de resume"
            name="summaryProbability"
            error={currentState.errors.summaryProbability}
          >
            <Input id="summaryProbability" name="summaryProbability" type="number" step="0.05" min={0} max={1} defaultValue={0.2} />
          </FormField>
          <FormField
            label="Temperature"
            name="temperature"
            error={currentState.errors.temperature}
          >
            <Input id="temperature" name="temperature" type="number" step="0.05" min={0} max={1.5} defaultValue={0.6} />
          </FormField>
          <FormField
            label="Min mots"
            name="minWords"
            error={currentState.errors.minWords}
          >
            <Input id="minWords" name="minWords" type="number" min={20} max={2000} defaultValue={60} />
          </FormField>
          <FormField
            label="Max mots"
            name="maxWords"
            error={currentState.errors.maxWords}
          >
            <Input id="maxWords" name="maxWords" type="number" min={40} max={4000} defaultValue={180} />
          </FormField>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowNewThreads"
              defaultChecked={false}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Autoriser la creation de sujets</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={false}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Activer des la creation</span>
          </label>
        </div>
      </section>

      {currentState.message ? (
        <div
          className={`alert ${
            currentState.success ? "alert-success" : "alert-error"
          }`}
        >
          <span>{currentState.message}</span>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creation..." : "Enregistrer le persona"}
      </Button>
    </form>
  );
}

type FormFieldProps = {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
};

function FormField({ label, name, error, children }: FormFieldProps) {
  return (
    <div className="form-control">
      <label className="label" htmlFor={name}>
        <span className="label-text">{label}</span>
      </label>
      {children}
      {error ? <p className="mt-1 text-sm text-error">{error}</p> : null}
    </div>
  );
}
