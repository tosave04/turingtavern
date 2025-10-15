import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { callOllamaChat } from "@/lib/agents/ollama";
import {
  AgentActionResult,
  AgentActivityConfig,
} from "@/lib/agents/types";

const FALLBACK_REPLY =
  "Je suis en veille pour le moment, je reviendrai plus tard sur ce sujet.";

export async function runAgentTick(slug: string): Promise<AgentActionResult> {
  const persona = await prisma.agentPersona.findUnique({
    where: { slug },
    include: {
      schedules: true,
    },
  });

  if (!persona) {
    return { status: "error", message: `Agent ${slug} introuvable` };
  }

  if (!persona.isActive) {
    return { status: "skipped", reason: "inactive" };
  }

  const activity = parseActivityConfig(persona.activityConfig);
  const schedule = pickActiveSchedule(persona);
  if (!schedule) {
    return { status: "skipped", reason: "hors-plage-horaire" };
  }

  const targetThread = await findTargetThread(persona);
  if (!targetThread) {
    return { status: "skipped", reason: "aucun fil pertinent" };
  }

  const history = await prisma.post.findMany({
    where: { threadId: targetThread.id },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      author: {
        select: {
          username: true,
          profile: {
            select: {
              displayName: true,
            },
          },
        },
      },
      agentPersona: {
        select: {
          displayName: true,
          role: true,
        },
      },
    },
  });

  const messages = buildMessages(persona.systemPrompt, persona.styleGuide, {
    threadTitle: targetThread.title,
    threadContent: targetThread.content,
    history,
  });

  const response = await callOllamaChat(messages, {
    temperature: activity.temperature,
    maxTokens: activity.maxWords * 3,
  });

  const content = response.ok ? response.content.trim() : FALLBACK_REPLY;

  const post = await prisma.post.create({
    data: {
      threadId: targetThread.id,
      content,
      agentPersonaId: persona.id,
      metadata: {
        generatedAt: new Date().toISOString(),
        via: "ollama",
        ollamaError: response.ok ? null : response.error,
      },
    },
  });

  return {
    status: "posted",
    threadId: targetThread.id,
    postId: post.id,
    content,
  };
}

function parseActivityConfig(value: unknown): AgentActivityConfig {
  if (typeof value === "object" && value !== null) {
    const activity = value as Partial<AgentActivityConfig>;
    return {
      maxDailyPosts: activity.maxDailyPosts ?? 4,
      replyProbability: activity.replyProbability ?? 0.5,
      summaryProbability: activity.summaryProbability ?? 0.2,
      temperature: activity.temperature ?? 0.6,
      minWords: activity.minWords ?? 60,
      maxWords: activity.maxWords ?? 160,
      allowNewThreads: activity.allowNewThreads ?? false,
    };
  }
  return {
    maxDailyPosts: 4,
    replyProbability: 0.5,
    summaryProbability: 0.2,
    temperature: 0.6,
    minWords: 60,
    maxWords: 160,
    allowNewThreads: false,
  };
}

function pickActiveSchedule(
  persona:
    | null
    | {
        schedules?: Array<{
          activeDays: unknown;
          windowStart: string;
          windowEnd: string;
          timezone: string;
        }>;
      },
) {
  if (!persona?.schedules || persona.schedules.length === 0) {
    return null;
  }

  const now = new Date();
  const weekday = now.getUTCDay();

  return persona.schedules.find((schedule) => {
    if (!schedule.activeDays) return false;
    try {
      const activeDays =
        typeof schedule.activeDays === "string"
          ? JSON.parse(schedule.activeDays)
          : schedule.activeDays;
      if (!Array.isArray(activeDays)) return false;
      if (!activeDays.includes(weekday)) return false;

      const [startHour, startMinute] = schedule.windowStart
        .split(":")
        .map(Number);
      const [endHour, endMinute] = schedule.windowEnd.split(":").map(Number);
      const localeNow = toTimezone(now, schedule.timezone);
      const minutes = localeNow.getHours() * 60 + localeNow.getMinutes();
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      return minutes >= start && minutes <= end;
    } catch {
      return false;
    }
  });
}

async function findTargetThread(persona: {
  id: string;
  domains: Prisma.JsonValue | null;
}) {
  const domainsArray = Array.isArray(persona.domains)
    ? (persona.domains as string[])
    : [];

  const thread = await prisma.thread.findFirst({
    orderBy: { updatedAt: "asc" },
    where: {
      locked: false,
    },
  });

  return thread;
}

function buildMessages(
  systemPrompt: string,
  styleGuide: string | null | undefined,
  context: {
    threadTitle: string;
    threadContent: string;
    history: Array<{
      content: string;
      author: { username: string; profile: { displayName: string | null } | null } | null;
      agentPersona: { displayName: string; role: string } | null;
    }>;
  },
) {
  const historyText = context.history
    .map((entry) => {
      const speaker =
        entry.agentPersona?.displayName ??
        entry.author?.profile?.displayName ??
        entry.author?.username ??
        "Membre";
      return `${speaker}: ${entry.content}`;
    })
    .reverse()
    .join("\n");

  const style = styleGuide ? `Consignes de style: ${styleGuide}` : "";

  return [
    {
      role: "system" as const,
      content: `${systemPrompt}\n${style}`,
    },
    {
      role: "user" as const,
      content: [
        `Sujet: ${context.threadTitle}`,
        `Message initial: ${context.threadContent}`,
        historyText ? `Historique:\n${historyText}` : "Aucune reponse encore.",
        "Propose une reponse adaptÃ©e au ton demandÃ©.",
      ].join("\n\n"),
    },
  ];
}

function toTimezone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
}
