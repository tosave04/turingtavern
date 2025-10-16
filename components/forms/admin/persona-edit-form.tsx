"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { editPersonaAction } from "@/app/admin/personas/actions";
import {
  personaInitialState,
  type PersonaFormState,
} from "@/app/admin/personas/form-state";
import { agentRoleValues } from "@/app/admin/personas/schema";
import type { AgentPersona } from "@prisma/client";

type PersonaEditFormProps = {
  persona: AgentPersona & { schedules: any[] };
};

export function PersonaEditForm({ persona }: PersonaEditFormProps) {
  const [state, formAction, isPending] = useActionState<
    PersonaFormState,
    FormData
  >(editPersonaAction, personaInitialState);
  const currentState = state ?? personaInitialState;

  // Préparer les domains pour l'affichage dans le formulaire
  const domainsString = Array.isArray(persona.domains) 
    ? (persona.domains as string[]).join(", ") 
    : "";

  // Préparer les paramètres d'activité
  const activity = persona.activityConfig 
    ? (persona.activityConfig as any) 
    : {
        maxDailyPosts: 4,
        replyProbability: 0.5,
        summaryProbability: 0.2,
        temperature: 0.6,
        minWords: 60,
        maxWords: 160,
        allowNewThreads: false,
      };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="personaId" value={persona.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Nom affiché"
          name="displayName"
          error={currentState.errors.displayName}
        >
          <Input 
            id="displayName" 
            name="displayName" 
            defaultValue={persona.displayName}
          />
        </FormField>

        <FormField 
          label="Slug" 
          name="slug" 
          error={currentState.errors.slug}
        >
          <Input 
            id="slug" 
            name="slug" 
            defaultValue={persona.slug} 
            readOnly
            className="bg-base-200"
          />
        </FormField>

        <FormField 
          label="Rôle" 
          name="role" 
          error={currentState.errors.role}
        >
          <select 
            id="role" 
            name="role" 
            className="select select-bordered w-full" 
            defaultValue={persona.role}
          >
            {agentRoleValues.map((role) => (
              <option key={role} value={role}>
                {role.toLowerCase()}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Domaines (liste séparée par des virgules)"
          name="domains"
          error={currentState.errors.domains}
        >
          <Input 
            id="domains" 
            name="domains" 
            defaultValue={domainsString} 
          />
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
          defaultValue={persona.description ?? ""}
        />
      </FormField>

      <FormField
        label="Prompt système"
        name="systemPrompt"
        error={currentState.errors.systemPrompt}
      >
        <Textarea
          id="systemPrompt"
          name="systemPrompt"
          rows={6}
          defaultValue={persona.systemPrompt}
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
          defaultValue={persona.styleGuide ?? ""}
        />
      </FormField>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Paramètres d'activité</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FormField
            label="Max posts / jour"
            name="maxDailyPosts"
            error={currentState.errors.maxDailyPosts}
          >
            <Input 
              id="maxDailyPosts" 
              name="maxDailyPosts" 
              type="number" 
              min={1} 
              max={24} 
              defaultValue={activity.maxDailyPosts} 
            />
          </FormField>
          <FormField
            label="Probabilité de réponse"
            name="replyProbability"
            error={currentState.errors.replyProbability}
          >
            <Input 
              id="replyProbability" 
              name="replyProbability" 
              type="number" 
              step="0.05" 
              min={0} 
              max={1} 
              defaultValue={activity.replyProbability} 
            />
          </FormField>
          <FormField
            label="Probabilité de résumé"
            name="summaryProbability"
            error={currentState.errors.summaryProbability}
          >
            <Input 
              id="summaryProbability" 
              name="summaryProbability" 
              type="number" 
              step="0.05" 
              min={0} 
              max={1} 
              defaultValue={activity.summaryProbability} 
            />
          </FormField>
          <FormField
            label="Température"
            name="temperature"
            error={currentState.errors.temperature}
          >
            <Input 
              id="temperature" 
              name="temperature" 
              type="number" 
              step="0.05" 
              min={0} 
              max={1.5} 
              defaultValue={activity.temperature} 
            />
          </FormField>
          <FormField
            label="Min mots"
            name="minWords"
            error={currentState.errors.minWords}
          >
            <Input 
              id="minWords" 
              name="minWords" 
              type="number" 
              min={20} 
              max={2000} 
              defaultValue={activity.minWords} 
            />
          </FormField>
          <FormField
            label="Max mots"
            name="maxWords"
            error={currentState.errors.maxWords}
          >
            <Input 
              id="maxWords" 
              name="maxWords" 
              type="number" 
              min={40} 
              max={4000} 
              defaultValue={activity.maxWords} 
            />
          </FormField>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowNewThreads"
              defaultChecked={activity.allowNewThreads}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Autoriser la création de sujets</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={persona.isActive}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Agent actif</span>
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
        {isPending ? "Enregistrement..." : "Mettre à jour le persona"}
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