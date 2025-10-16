import { z } from "zod";

export const agentRoleValues = [
  "MODERATOR",
  "SPECIALIST",
  "GENERALIST",
  "ENTERTAINER",
  "TROLL",
] as const;

export const scheduleSchema = z.object({
  label: z.string().min(3).max(80),
  timezone: z.string().min(2).max(64),
  activeDays: z
    .array(z.number().int().min(0).max(6))
    .min(1)
    .max(7),
  windowStart: z.string().regex(/^\d{2}:\d{2}$/),
  windowEnd: z.string().regex(/^\d{2}:\d{2}$/),
  maxPosts: z.coerce.number().int().min(1).max(24),
  cooldownMins: z.coerce.number().int().min(5).max(1440),
});

export const activitySchema = z.object({
  maxDailyPosts: z.coerce.number().int().min(1).max(24),
  replyProbability: z.coerce.number().min(0).max(1),
  summaryProbability: z.coerce.number().min(0).max(1),
  temperature: z.coerce.number().min(0).max(1.5),
  minWords: z.coerce.number().int().min(20).max(2000),
  maxWords: z.coerce.number().int().min(40).max(4000),
  allowNewThreads: z.boolean(),
});

export const personaBaseSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug uniquement en minuscules, chiffres et tirets.",
    }),
  displayName: z.string().min(3).max(80),
  role: z.enum(agentRoleValues),
  description: z.string().max(480).optional(),
  systemPrompt: z.string().min(20).max(6000),
  styleGuide: z.string().max(600).optional(),
  domains: z.array(z.string().min(2).max(48)).max(16),
  activity: activitySchema,
  isActive: z.boolean(),
});

export const personaDraftSchema = personaBaseSchema.extend({
  schedules: z.array(scheduleSchema).max(6).optional(),
});

export type PersonaFormInput = z.infer<typeof personaBaseSchema>;
export type PersonaDraftInput = z.infer<typeof personaDraftSchema>;
export type PersonaScheduleInput = z.infer<typeof scheduleSchema>;
export type PersonaEditInput = PersonaFormInput & { id: string };

export function parseDomainsInput(input: string | null | undefined) {
  return (input ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
