"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { editScheduleAction, deleteScheduleAction } from "@/app/admin/personas/actions";
import { scheduleInitialState } from "@/app/admin/personas/schedule-form-state";
import { Trash2 } from "lucide-react";

type ScheduleEditFormProps = {
  schedule?: {
    id: string;
    label: string;
    timezone: string;
    activeDays: number[];
    windowStart: string;
    windowEnd: string;
    maxPosts: number;
    cooldownMins: number;
  };
  personaId: string;
  isNew?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
};

const weekdays = [
  { value: 0, label: "Dim" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
];

const timezones = [
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Europe/London",
  "Australia/Sydney",
];

export function ScheduleEditForm({ 
  schedule, 
  personaId, 
  isNew = false,
  onCancel,
  onSuccess
}: ScheduleEditFormProps) {
  const [state, formAction, isPending] = useActionState(
    editScheduleAction, 
    scheduleInitialState
  );
  
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteScheduleAction,
    scheduleInitialState
  );
  
  // S'assurer que l'état courant contient toujours un objet 'errors' valide
  const currentState = {
    ...scheduleInitialState,
    ...(state || {})
  };
  
  const handleSubmitSuccess = () => {
    if (currentState.success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <form action={formAction} className="space-y-4" onSubmit={handleSubmitSuccess}>
      <input type="hidden" name="personaId" value={personaId} />
      {schedule && <input type="hidden" name="scheduleId" value={schedule.id} />}
      
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Nom de la plage"
          name="label"
          error={currentState.errors.label}
        >
          <Input 
            id="label" 
            name="label" 
            defaultValue={schedule?.label ?? ""} 
            placeholder="ex: Matinée Europe"
          />
        </FormField>
        
        <FormField
          label="Fuseau horaire"
          name="timezone"
          error={currentState.errors.timezone}
        >
          <select 
            id="timezone" 
            name="timezone" 
            className="select select-bordered w-full" 
            defaultValue={schedule?.timezone ?? "Europe/Paris"}
          >
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </FormField>
      </div>
      
      <FormField
        label="Jours actifs"
        name="activeDays"
        error={currentState.errors.activeDays}
      >
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <label key={day.value} className="flex items-center gap-2 border border-base-300 rounded-lg px-3 py-1">
              <input
                type="checkbox"
                name="activeDays"
                value={day.value}
                defaultChecked={schedule?.activeDays.includes(day.value) ?? false}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">{day.label}</span>
            </label>
          ))}
        </div>
      </FormField>
      
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Heure de début (HH:MM)"
          name="windowStart"
          error={currentState.errors.windowStart}
        >
          <Input 
            id="windowStart" 
            name="windowStart" 
            placeholder="08:00" 
            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            defaultValue={schedule?.windowStart ?? "08:00"} 
          />
        </FormField>
        
        <FormField
          label="Heure de fin (HH:MM)"
          name="windowEnd"
          error={currentState.errors.windowEnd}
        >
          <Input 
            id="windowEnd" 
            name="windowEnd" 
            placeholder="12:00" 
            pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
            defaultValue={schedule?.windowEnd ?? "12:00"} 
          />
        </FormField>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Max posts dans cette plage"
          name="maxPosts"
          error={currentState.errors.maxPosts}
        >
          <Input 
            id="maxPosts" 
            name="maxPosts" 
            type="number" 
            min={1} 
            max={24} 
            defaultValue={schedule?.maxPosts ?? 3} 
          />
        </FormField>
        
        <FormField
          label="Temps d'attente (minutes)"
          name="cooldownMins"
          error={currentState.errors.cooldownMins}
        >
          <Input 
            id="cooldownMins" 
            name="cooldownMins" 
            type="number" 
            min={5} 
            max={1440} 
            defaultValue={schedule?.cooldownMins ?? 30} 
          />
        </FormField>
      </div>
      
      {currentState.message && (
        <div
          className={`alert ${
            currentState.success ? "alert-success" : "alert-error"
          }`}
        >
          <span>{currentState.message}</span>
        </div>
      )}
      
      <div className="flex flex-wrap justify-between gap-2">
        <div className="space-x-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : isNew ? "Créer la plage" : "Mettre à jour"}
          </Button>
          
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
        
        {!isNew && schedule && (
          <Button 
            type="button" 
            className="btn btn-error" 
            disabled={isDeleting}
            onClick={() => {
              const formData = new FormData();
              formData.append("scheduleId", schedule.id);
              formData.append("personaId", personaId);
              deleteAction(formData);
            }}
          >
            <Trash2 className="size-4 mr-2" />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        )}
      </div>
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