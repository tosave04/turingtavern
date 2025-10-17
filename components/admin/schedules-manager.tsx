"use client";

import { useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { ScheduleEditForm } from "@/components/forms/admin/schedule-edit-form";
import type { AgentPersona } from "@prisma/client";

type SchedulesManagerProps = {
  persona: AgentPersona & { schedules: any[] };
};

export function SchedulesManager({ persona }: SchedulesManagerProps) {
  const [editMode, setEditMode] = useState<"new" | string | null>(null);
  
  // Si on est en mode édition, afficher le formulaire pour la plage sélectionnée
  const currentSchedule = typeof editMode === "string" && editMode !== "new"
    ? persona.schedules.find(s => s.id === editMode)
    : undefined;
  
  return (
    <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Plages horaires</h2>
        
        {!editMode && (
          <button 
            className="btn btn-sm btn-outline" 
            type="button"
            onClick={() => setEditMode("new")}
          >
            <Plus className="size-4" /> Ajouter
          </button>
        )}
      </div>
      
      {editMode === "new" && (
        <div className="mt-4 border-t border-base-300/60 pt-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Plus className="size-4" /> Nouvelle plage horaire
          </h3>
          
          <ScheduleEditForm 
            personaId={persona.id} 
            isNew={true}
            onCancel={() => setEditMode(null)}
            onSuccess={() => setEditMode(null)}
          />
        </div>
      )}
      
      {editMode && editMode !== "new" && currentSchedule && (
        <div className="mt-4 border-t border-base-300/60 pt-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Calendar className="size-4" /> Édition de "{currentSchedule.label}"
          </h3>
          
          <ScheduleEditForm 
            schedule={currentSchedule}
            personaId={persona.id}
            onCancel={() => setEditMode(null)}
            onSuccess={() => setEditMode(null)}
          />
        </div>
      )}
      
      {!editMode && (
        persona.schedules.length === 0 ? (
          <p className="mt-3 text-sm text-base-content/60">
            Aucune plage configurée. Utilisez le bouton "Ajouter" pour créer des plages horaires d'activité pour ce persona.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {persona.schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="group cursor-pointer rounded-xl border border-base-300/60 bg-base-200/50 p-4 text-sm transition-all hover:border-primary/60"
                onClick={() => setEditMode(schedule.id)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{schedule.label}</p>
                  <span className="text-xs opacity-0 transition-opacity group-hover:opacity-100">Cliquez pour éditer</span>
                </div>
                <p className="text-base-content/70">
                  {schedule.windowStart} - {schedule.windowEnd} ({schedule.timezone})
                </p>
                <p className="text-base-content/70">
                  Jours: {formatDays(schedule.activeDays)}
                </p>
                <p className="text-base-content/50">
                  Max {schedule.maxPosts} posts, cooldown {schedule.cooldownMins} min
                </p>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}

function formatDays(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return "Non défini";
  }
  
  const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return value.map(day => typeof day === 'number' ? dayLabels[day] : day).join(", ");
}