"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { firstFieldErrors } from "@/lib/zod-errors";
import {
  personaBaseSchema,
  personaDraftSchema,
  parseDomainsInput,
  agentRoleValues,
  type PersonaDraftInput,
  type PersonaFormInput,
  type PersonaScheduleInput,
  type PersonaEditInput,
} from "@/app/admin/personas/schema";
import {
  personaInitialState,
  type PersonaFormState,
} from "@/app/admin/personas/form-state";

const formSchema = z.object({
  slug: z
    .string()
    .min(3, "Slug requis.")
    .max(64, "Slug trop long.")
    .regex(/^[a-z0-9-]+$/, "Utilisez uniquement minuscules, chiffres, tirets."),
  displayName: z
    .string()
    .min(3, "Nom trop court.")
    .max(80, "Nom trop long."),
  role: z.enum(agentRoleValues),
  description: z.string().max(480, "Description trop longue.").optional(),
  systemPrompt: z
    .string()
    .min(20, "Prompt trop court.")
    .max(6000, "Prompt trop long."),
  styleGuide: z.string().max(600, "Guide de style trop long.").optional(),
  domains: z.string().max(320, "200 caracteres maximum.").optional(),
  maxDailyPosts: z.coerce.number().int().min(1).max(24),
  replyProbability: z.coerce.number().min(0).max(1),
  summaryProbability: z.coerce.number().min(0).max(1),
  temperature: z.coerce.number().min(0).max(1.5),
  minWords: z.coerce.number().int().min(20).max(2000),
  maxWords: z.coerce.number().int().min(40).max(4000),
  allowNewThreads: z.boolean(),
  isActive: z.boolean(),
});

function formDataToPayload(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    role: String(formData.get("role") ?? ""),
    description: toOptionalString(formData.get("description")),
    systemPrompt: String(formData.get("systemPrompt") ?? ""),
    styleGuide: toOptionalString(formData.get("styleGuide")),
    domains: String(formData.get("domains") ?? ""),
    maxDailyPosts: formData.get("maxDailyPosts"),
    replyProbability: formData.get("replyProbability"),
    summaryProbability: formData.get("summaryProbability"),
    temperature: formData.get("temperature"),
    minWords: formData.get("minWords"),
    maxWords: formData.get("maxWords"),
    allowNewThreads: checkboxToBoolean(formData.get("allowNewThreads")),
    isActive: checkboxToBoolean(formData.get("isActive")),
  };
}

function checkboxToBoolean(value: FormDataEntryValue | null) {
  if (typeof value === "string") {
    return value === "on" || value === "true";
  }
  return Boolean(value);
}

function toOptionalString(value: FormDataEntryValue | null) {
  if (value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildPersonaInput(parsed: z.infer<typeof formSchema>): PersonaFormInput {
  return {
    slug: parsed.slug,
    displayName: parsed.displayName,
    role: parsed.role,
    description: parsed.description,
    systemPrompt: parsed.systemPrompt,
    styleGuide: parsed.styleGuide,
    domains: parseDomainsInput(parsed.domains ?? ""),
    activity: {
      maxDailyPosts: parsed.maxDailyPosts,
      replyProbability: parsed.replyProbability,
      summaryProbability: parsed.summaryProbability,
      temperature: parsed.temperature,
      minWords: parsed.minWords,
      maxWords: parsed.maxWords,
      allowNewThreads: parsed.allowNewThreads,
    },
    isActive: parsed.isActive,
  };
}

export async function createPersonaFromForm(
  _state: PersonaFormState,
  formData: FormData,
): Promise<PersonaFormState> {
  await requireAdmin();

  const payload = formDataToPayload(formData);
  const parsed = formSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ...personaInitialState,
      errors: firstFieldErrors(parsed.error),
    };
  }

  const personaInput = personaBaseSchema.safeParse(buildPersonaInput(parsed.data));
  if (!personaInput.success) {
    return {
      ...personaInitialState,
      errors: { ...firstFieldErrors(personaInput.error) },
    };
  }

  try {
    await assertSlugAvailable(personaInput.data.slug);
    await prisma.agentPersona.create({
      data: {
        slug: personaInput.data.slug,
        displayName: personaInput.data.displayName,
        role: personaInput.data.role,
        description: personaInput.data.description ?? null,
        systemPrompt: personaInput.data.systemPrompt,
        styleGuide: personaInput.data.styleGuide ?? null,
        domains: personaInput.data.domains,
        activityConfig: personaInput.data.activity,
        isActive: personaInput.data.isActive,
      },
    });
  } catch (error) {
    return {
      success: false,
      errors: {},
      message:
        error instanceof Error
          ? error.message
          : "Creation du persona impossible pour le moment.",
    };
  }

  revalidatePath("/admin/personas");
  revalidatePath(`/admin/personas/${personaInput.data.slug}`);

  return {
    success: true,
    errors: {},
    message: "Persona cree avec succes.",
  };
}

export async function createPersonaFromDraft(
  draft: PersonaDraftInput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  await requireAdmin();

  const parsed = personaDraftSchema.safeParse({
    ...draft,
    domains: draft.domains,
    schedules: draft.schedules,
  });

  if (!parsed.success) {
    return { ok: false, error: "Suggestion invalide." };
  }

  try {
    await assertSlugAvailable(parsed.data.slug);
    await prisma.agentPersona.create({
      data: {
        slug: parsed.data.slug,
        displayName: parsed.data.displayName,
        role: parsed.data.role,
        description: parsed.data.description ?? null,
        systemPrompt: parsed.data.systemPrompt,
        styleGuide: parsed.data.styleGuide ?? null,
        domains: parsed.data.domains,
        activityConfig: parsed.data.activity,
        isActive: parsed.data.isActive,
        schedules: parsed.data.schedules?.length
          ? {
              create: parsed.data.schedules.map((schedule) =>
                scheduleToCreateInput(schedule),
              ),
            }
          : undefined,
      },
    });
    revalidatePath("/admin/personas");
    revalidatePath(`/admin/personas/${parsed.data.slug}`);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Creation du persona impossible pour le moment.",
    };
  }

  return { ok: true, slug: parsed.data.slug };
}

async function assertSlugAvailable(slug: string) {
  const existing = await prisma.agentPersona.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing) {
    throw new Error("Un persona avec ce slug existe deja.");
  }
}

function scheduleToCreateInput(schedule: PersonaScheduleInput) {
  return {
    label: schedule.label,
    timezone: schedule.timezone,
    activeDays: schedule.activeDays,
    windowStart: schedule.windowStart,
    windowEnd: schedule.windowEnd,
    maxPosts: schedule.maxPosts,
    cooldownMins: schedule.cooldownMins,
  };
}

export async function editPersonaAction(
  _state: PersonaFormState,
  formData: FormData,
): Promise<PersonaFormState> {
  await requireAdmin();

  const personaId = String(formData.get("personaId") ?? "");
  if (!personaId) {
    return {
      ...personaInitialState,
      success: false,
      message: "ID du persona manquant.",
      errors: {},
    };
  }

  const payload = formDataToPayload(formData);
  const parsed = formSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ...personaInitialState,
      errors: firstFieldErrors(parsed.error),
    };
  }

  const personaInput = personaBaseSchema.safeParse(buildPersonaInput(parsed.data));
  if (!personaInput.success) {
    return {
      ...personaInitialState,
      errors: { ...firstFieldErrors(personaInput.error) },
    };
  }

  try {
    await prisma.agentPersona.update({
      where: { id: personaId },
      data: {
        displayName: personaInput.data.displayName,
        role: personaInput.data.role,
        description: personaInput.data.description ?? null,
        systemPrompt: personaInput.data.systemPrompt,
        styleGuide: personaInput.data.styleGuide ?? null,
        domains: personaInput.data.domains,
        activityConfig: personaInput.data.activity,
        isActive: personaInput.data.isActive,
      },
    });
  } catch (error) {
    return {
      success: false,
      errors: {},
      message:
        error instanceof Error
          ? error.message
          : "Mise à jour du persona impossible pour le moment.",
    };
  }

  revalidatePath("/admin/personas");
  revalidatePath(`/admin/personas/${personaInput.data.slug}`);

  return {
    success: true,
    errors: {},
    message: "Persona mis à jour avec succès.",
  };
}

// Schéma pour les plages horaires
const scheduleFormSchema = z.object({
  personaId: z.string().min(1),
  scheduleId: z.string().optional(),
  label: z.string().min(3, "Nom requis.").max(80, "Nom trop long."),
  timezone: z.string().min(2, "Fuseau horaire requis.").max(64),
  activeDays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "Sélectionnez au moins un jour."),
  windowStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format invalide. Utilisez HH:MM"),
  windowEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format invalide. Utilisez HH:MM"),
  maxPosts: z.coerce.number().int().min(1).max(24),
  cooldownMins: z.coerce.number().int().min(5).max(1440),
});

// Type pour l'état du formulaire de plages horaires
import { scheduleInitialState, type ScheduleFormState } from "@/app/admin/personas/schedule-form-state";

// Action pour ajouter ou mettre à jour une plage horaire
export async function editScheduleAction(
  _state: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  await requireAdmin();
  
  // Récupérer les valeurs du formulaire
  const personaId = String(formData.get("personaId") ?? "");
  const scheduleId = formData.get("scheduleId") ? String(formData.get("scheduleId")) : undefined;
  const isEditing = Boolean(scheduleId);
  
  // Vérifier que l'ID du persona est présent
  if (!personaId) {
    return {
      ...scheduleInitialState,
      success: false,
      message: "ID du persona manquant.",
      errors: {},
    };
  }
  
  // Préparer les données du formulaire pour la validation
  const activeDaysValues = formData.getAll("activeDays").map(day => Number(day));
  
  const payload = {
    personaId,
    scheduleId,
    label: String(formData.get("label") ?? ""),
    timezone: String(formData.get("timezone") ?? ""),
    activeDays: activeDaysValues,
    windowStart: String(formData.get("windowStart") ?? ""),
    windowEnd: String(formData.get("windowEnd") ?? ""),
    maxPosts: formData.get("maxPosts"),
    cooldownMins: formData.get("cooldownMins"),
  };
  
  // Valider les données
  const parsed = scheduleFormSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ...scheduleInitialState,
      errors: firstFieldErrors(parsed.error),
    };
  }
  
  try {
    // Vérifier que le persona existe
    const persona = await prisma.agentPersona.findUnique({
      where: { id: personaId },
      select: { id: true, slug: true },
    });
    
    if (!persona) {
      return {
        ...scheduleInitialState,
        success: false,
        message: "Le persona n'existe pas.",
        errors: {},
      };
    }
    
    // Selon qu'il s'agit d'une création ou d'une édition
    if (isEditing && scheduleId) {
      await prisma.agentSchedule.update({
        where: { id: scheduleId },
        data: {
          label: parsed.data.label,
          timezone: parsed.data.timezone,
          activeDays: parsed.data.activeDays,
          windowStart: parsed.data.windowStart,
          windowEnd: parsed.data.windowEnd,
          maxPosts: parsed.data.maxPosts,
          cooldownMins: parsed.data.cooldownMins,
        },
      });
    } else {
      await prisma.agentSchedule.create({
        data: {
          persona: {
            connect: { id: personaId },
          },
          label: parsed.data.label,
          timezone: parsed.data.timezone,
          activeDays: parsed.data.activeDays,
          windowStart: parsed.data.windowStart,
          windowEnd: parsed.data.windowEnd,
          maxPosts: parsed.data.maxPosts,
          cooldownMins: parsed.data.cooldownMins,
        },
      });
    }
    
    // Invalider le cache pour mettre à jour les pages
    revalidatePath("/admin/personas");
    revalidatePath(`/admin/personas/${persona.slug}`);
    
    return {
      ...scheduleInitialState,
      success: true,
      message: isEditing 
        ? "Plage horaire mise à jour avec succès." 
        : "Plage horaire créée avec succès.",
    };
    
  } catch (error) {
    return {
      ...scheduleInitialState,
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "Opération impossible pour le moment.",
      errors: {},
    };
  }
}

// Action pour supprimer une plage horaire
export async function deleteScheduleAction(
  _state: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  await requireAdmin();
  
  const scheduleId = String(formData.get("scheduleId") ?? "");
  const personaId = String(formData.get("personaId") ?? "");
  
  if (!scheduleId || !personaId) {
    return {
      ...scheduleInitialState,
      success: false,
      message: "ID manquant.",
      errors: {},
    };
  }
  
  try {
    // Récupérer le slug du persona pour la révalidation des chemins
    const persona = await prisma.agentPersona.findUnique({
      where: { id: personaId },
      select: { slug: true },
    });
    
    if (!persona) {
      return {
        ...scheduleInitialState,
        success: false,
        message: "Le persona n'existe pas.",
        errors: {},
      };
    }
    
    // Supprimer la plage horaire
    await prisma.agentSchedule.delete({
      where: { id: scheduleId },
    });
    
    // Invalider le cache pour mettre à jour les pages
    revalidatePath("/admin/personas");
    revalidatePath(`/admin/personas/${persona.slug}`);
    
    return {
      ...scheduleInitialState,
      success: true,
      message: "Plage horaire supprimée avec succès.",
    };
    
  } catch (error) {
    return {
      ...scheduleInitialState,
      success: false,
      message: error instanceof Error 
        ? error.message 
        : "Suppression impossible pour le moment.",
      errors: {},
    };
  }
}
