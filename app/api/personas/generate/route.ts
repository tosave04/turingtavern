import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { callOllamaChat } from "@/lib/agents/ollama";
import {
  agentRoleValues,
  personaDraftSchema,
  type PersonaDraftInput,
} from "@/app/admin/personas/schema";

const briefSchema = z.object({
  name: z.string().min(3).max(80),
  role: z.enum(agentRoleValues).optional(),
  mission: z.string().min(10).max(600),
  tone: z.string().max(200).optional(),
  expertise: z.string().max(240).optional(),
  scheduleHint: z.string().max(240).optional(),
  allowNewThreads: z.boolean().optional(),
});

type GeneratorPayload = z.infer<typeof briefSchema>;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = briefSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const promptMessages = buildPrompt(parsed.data);
  const response = await callOllamaChat(promptMessages, {
    temperature: 0.4,
    maxTokens: 1024,
  });

  if (!response.ok) {
    return NextResponse.json({ error: response.error }, { status: 502 });
  }

  const extracted = extractJson(response.content);
  if (!extracted) {
    return NextResponse.json(
      { error: "Model response invalid." },
      { status: 422 },
    );
  }

  const draft = personaDraftSchema.safeParse(extracted);
  if (!draft.success) {
    return NextResponse.json(
      { error: "Model output rejected." },
      { status: 422 },
    );
  }

  return NextResponse.json({
    draft: draft.data as PersonaDraftInput,
    raw: response.content,
  });
}

function buildPrompt(payload: GeneratorPayload) {
  const base = [
    {
      role: "system" as const,
      content: [
        "Tu es un assistant qui conoit des personas d agents pour un forum communautaire.",
        "Tu dois repondre avec un JSON strict, sans texte supplementaire.",
        "Schema attendu:",
        JSON.stringify(
          {
            slug: "kebab-case",
            displayName: "Nom complet",
            role: "MODERATOR | SPECIALIST | GENERALIST | ENTERTAINER | TROLL",
            description: "Resume court",
            systemPrompt: "Instructions detaillees pour le LLM",
            styleGuide: "Guide de style optionnel",
            domains: ["liste", "de", "domains"],
            activity: {
              maxDailyPosts: 4,
              replyProbability: 0.7,
              summaryProbability: 0.2,
              temperature: 0.6,
              minWords: 60,
              maxWords: 180,
              allowNewThreads: false,
            },
            isActive: false,
            schedules: [
              {
                label: "Nom de la plage",
                timezone: "Europe/Paris",
                activeDays: [1, 3, 5],
                windowStart: "08:00",
                windowEnd: "11:30",
                maxPosts: 3,
                cooldownMins: 60,
              },
            ],
          },
          null,
          2,
        ),
        "Respecte scrupuleusement ce format.",
        "Choisis des valeurs coherentes avec le brief et evite les doublons dans les domaines et les horaires.",
        "activeDays doivent contenir des entiers 0-6 (0 = dimanche).",
        "isActive doit etre false par defaut, le persona sera active apres validation humaine.",
        "Le slug doit etre derive du nom en kebab-case, sans caractere special.",
      ].join("\n"),
    },
  ];

  const userLines = [
    `Nom souhaite : ${payload.name}`,
    `Role cible : ${payload.role ?? "auto"}`,
    `Mission : ${payload.mission}`,
    `Ton souhaite : ${payload.tone ?? "auto"}`,
    `Expertise ou domaines : ${payload.expertise ?? "non precise"}`,
    `Contraintes horaires : ${payload.scheduleHint ?? "non precise"}`,
    `Autoriser nouveaux sujets : ${payload.allowNewThreads ? "oui" : "non"}`,
  ];

  return [
    ...base,
    {
      role: "user" as const,
      content: userLines.join("\n"),
    },
  ];
}

function extractJson(content: string) {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]) as PersonaDraftInput;
  } catch {
    return null;
  }
}
