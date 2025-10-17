import { AgentRunStatus, AgentTaskType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { callOllamaChat } from "@/lib/agents/ollama";
import { AgentActionResult, AgentActivityConfig } from "@/lib/agents/types";
import { buildInitiativeContext, buildReplyContext } from "@/lib/agents/context";
import { countAgentPostsToday, selectAgentTask, type AgentTask } from "@/lib/agents/scheduler";
import { createPost, createThread } from "@/lib/forum";
import { logAgentRun } from "@/lib/agents/logs";

const FALLBACK_REPLY =
  "Je suis en veille pour le moment, je reviendrai plus tard sur ce sujet.";

export async function runAgentTick(slug: string): Promise<AgentActionResult> {
  const persona = await prisma.agentPersona.findUnique({
    where: { slug },
    include: { schedules: true },
  });

  if (!persona) {
    return { status: "error", message: `Agent ${slug} introuvable` };
  }

  if (!persona.isActive) {
    await logAgentRun({
      personaId: persona.id,
      taskType: AgentTaskType.IDLE,
      status: AgentRunStatus.SKIPPED,
      metadata: { reason: "inactive" },
    });
    return { status: "skipped", reason: "inactive" };
  }

  const activity = parseActivityConfig(persona.activityConfig);
  const schedule = pickActiveSchedule(persona);
  if (!schedule) {
    await logAgentRun({
      personaId: persona.id,
      taskType: AgentTaskType.IDLE,
      status: AgentRunStatus.SKIPPED,
      metadata: { reason: "hors-plage-horaire" },
    });
    return { status: "skipped", reason: "hors-plage-horaire" };
  }

  const postsToday = await countAgentPostsToday(persona.id);
  if (postsToday >= activity.maxDailyPosts) {
    await logAgentRun({
      personaId: persona.id,
      taskType: AgentTaskType.IDLE,
      status: AgentRunStatus.SKIPPED,
      metadata: { reason: "quota-journalier-atteint" },
    });
    return { status: "skipped", reason: "quota-journalier-atteint" };
  }

  const task = await selectAgentTask(persona, activity);
  if (!task) {
    await logAgentRun({
      personaId: persona.id,
      taskType: AgentTaskType.IDLE,
      status: AgentRunStatus.SKIPPED,
      metadata: { reason: "aucune-tache-prioritaire" },
    });
    return { status: "skipped", reason: "aucune-tache-prioritaire" };
  }

  const taskType = mapTaskType(task.type);
  const startedAt = Date.now();

  try {
    let result: AgentActionResult;
    switch (task.type) {
      case "reply":
        result = await executeReplyTask(persona, activity, task);
        break;
      case "new-thread":
        if (Math.random() > activity.replyProbability) {
          result = { status: "skipped", reason: "initiative-annulee" };
        } else {
          result = await executeNewThreadTask(persona, activity, task);
        }
        break;
      case "summarize":
        if (Math.random() > activity.summaryProbability) {
          result = { status: "skipped", reason: "resume-non-selectionne" };
        } else {
          result = await executeSummaryTask(persona, activity, task);
        }
        break;
      default:
        result = { status: "skipped", reason: "tache-non-supportee" };
    }

    const durationMs = Date.now() - startedAt;
    await logFromResult({ personaId: persona.id, taskType, durationMs, task, result });
    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await logAgentRun({
      personaId: persona.id,
      taskType,
      status: AgentRunStatus.ERROR,
      durationMs,
      threadId: getThreadIdFromTask(task),
      metadata: { task },
      error: message,
    });

    console.error("[agents] runAgentTick error", error);
    return {
      status: "error",
      message: "Execution de l'agent échouée",
      details: error,
    };
  }
}

async function executeReplyTask(
  persona: Prisma.AgentPersonaGetPayload<{ include: { schedules: true } }>,
  activity: AgentActivityConfig,
  task: Extract<AgentTask, { type: "reply" }> ,
): Promise<AgentActionResult> {
  const context = await buildReplyContext(persona, task.threadId);
  if (!context) {
    return { status: "skipped", reason: "thread-indisponible" };
  }

  const messages = buildReplyMessages(persona, activity, context);
  const response = await callOllamaChat(messages, {
    temperature: activity.temperature,
    maxTokens: Math.max(activity.maxWords * 3, 512),
  });

  const content = response.ok ? response.content.trim() : FALLBACK_REPLY;

  const post = await createPost({
    threadId: context.thread.id,
    agentPersonaId: persona.id,
    content,
    metadata: {
      generatedAt: new Date().toISOString(),
      via: "ollama",
      error: response.ok ? null : response.error,
      summary: context.summary,
      webInsights: context.webInsights,
    },
  });

  await prisma.thread.update({
    where: { id: context.thread.id },
    data: { updatedAt: new Date() },
  });

  return {
    status: "posted",
    threadId: context.thread.id,
    postId: post.id,
    content,
  };
}

async function executeNewThreadTask(
  persona: Prisma.AgentPersonaGetPayload<{ include: { schedules: true } }>,
  activity: AgentActivityConfig,
  task: Extract<AgentTask, { type: "new-thread" }> ,
): Promise<AgentActionResult> {
  const initiative = await buildInitiativeContext(persona, task.categoryId, task.topic);

  const prompt = buildInitiativePrompt(persona, initiative);
  const response = await callOllamaChat(prompt, {
    temperature: Math.max(activity.temperature, 0.7),
    maxTokens: Math.max(activity.maxWords * 4, 800),
  });

  if (!response.ok) {
    return {
      status: "skipped",
      reason: `creation-thread-echec:${response.error}`,
    };
  }

  const parsed = parseThreadBlueprint(response.content);
  if (!parsed) {
    return { status: "skipped", reason: "creation-thread-format-invalide" };
  }

  const thread = await createThread({
    title: parsed.title,
    content: parsed.content,
    categoryId: initiative.categoryId,
    agentPersonaId: persona.id,
    tags: initiative.keywords.slice(0, 5),
  });

  return {
    status: "thread-created",
    threadId: thread.id,
    title: thread.title,
  };
}

async function executeSummaryTask(
  persona: Prisma.AgentPersonaGetPayload<{ include: { schedules: true } }>,
  activity: AgentActivityConfig,
  task: Extract<AgentTask, { type: "summarize" }> ,
): Promise<AgentActionResult> {
  const context = await buildReplyContext(persona, task.threadId);
  if (!context) {
    return { status: "skipped", reason: "thread-indisponible" };
  }

  const messages = buildSummaryMessages(persona, context);
  const response = await callOllamaChat(messages, {
    temperature: Math.min(activity.temperature, 0.4),
    maxTokens: 512,
  });

  if (!response.ok) {
    return {
      status: "skipped",
      reason: `resume-echec:${response.error}`,
    };
  }

  const post = await createPost({
    threadId: context.thread.id,
    agentPersonaId: persona.id,
    content: response.content.trim(),
    metadata: {
      generatedAt: new Date().toISOString(),
      via: "ollama",
      nature: "summary",
    },
  });

  return {
    status: "summarized",
    threadId: context.thread.id,
    postId: post.id,
  };
}

async function logFromResult(args: {
  personaId: string;
  taskType: AgentTaskType;
  durationMs: number;
  task: AgentTask;
  result: AgentActionResult;
}) {
  const { personaId, taskType, durationMs, task, result } = args;

  if (result.status === "posted") {
    await logAgentRun({
      personaId,
      taskType,
      status: AgentRunStatus.SUCCESS,
      durationMs,
      threadId: result.threadId,
      postId: result.postId,
      metadata: { length: result.content.length },
    });
    return;
  }

  if (result.status === "thread-created") {
    await logAgentRun({
      personaId,
      taskType,
      status: AgentRunStatus.SUCCESS,
      durationMs,
      threadId: result.threadId,
      metadata: { title: result.title },
    });
    return;
  }

  if (result.status === "summarized") {
    await logAgentRun({
      personaId,
      taskType,
      status: AgentRunStatus.SUCCESS,
      durationMs,
      threadId: result.threadId,
      postId: result.postId,
    });
    return;
  }

  if (result.status === "error") {
    await logAgentRun({
      personaId,
      taskType,
      status: AgentRunStatus.ERROR,
      durationMs,
      threadId: getThreadIdFromTask(task),
      metadata: { details: result.details },
      error: result.message,
    });
    return;
  }

  // skipped
  await logAgentRun({
    personaId,
    taskType,
    status: AgentRunStatus.SKIPPED,
    durationMs,
    threadId: getThreadIdFromTask(task),
    metadata: { reason: result.reason },
  });
}

function getThreadIdFromTask(task: AgentTask): string | undefined {
  if (task.type === "reply" || task.type === "summarize") {
    return task.threadId;
  }
  return undefined;
}

function mapTaskType(type: AgentTask["type"]): AgentTaskType {
  switch (type) {
    case "reply":
      return AgentTaskType.REPLY;
    case "new-thread":
      return AgentTaskType.NEW_THREAD;
    case "summarize":
      return AgentTaskType.SUMMARIZE;
    default:
      return AgentTaskType.IDLE;
  }
}

// existing helper functions (buildReplyMessages, buildSummaryMessages, etc.) here ...
function buildReplyMessages(
  persona: Prisma.AgentPersonaGetPayload<{ include: { schedules: true } }>,
  activity: AgentActivityConfig,
  context: NonNullable<Awaited<ReturnType<typeof buildReplyContext>>>,
) {
  const styleGuide = persona.styleGuide
    ? `Consignes stylistiques : ${persona.styleGuide}`
    : "Adopte un ton accessible, respectueux et précis.";

  const highlights = context.highlights
    .slice(-3)
    .map((point) => `- ${point}`)
    .join("\n");

  const historyText = context.history
    .slice(-5)
    .map((entry) => {
      const speaker =
        entry.agentPersona?.displayName ??
        entry.author?.profile?.displayName ??
        entry.author?.username ??
        "Membre";
      return `${speaker} > ${truncateText(entry.content, 220)}`;
    })
    .join("\n");

  const externalText =
    context.webInsights.length > 0
      ? context.webInsights
          .map(
            (item) =>
              `- ${item.title} (${item.source ?? item.url}) : ${truncateText(item.snippet || item.content || "", 200)}`,
          )
          .join("\n")
      : "Aucun signal externe pertinent.";

  return [
    {
      role: "system" as const,
      content: [
        persona.systemPrompt,
        styleGuide,
        `Respecte ces contraintes : réponse entre ${activity.minWords} et ${activity.maxWords} mots, écriture en Markdown (titres facultatifs, listes possibles, citations quand tu t'appuies sur les sources).`,
        "Cite explicitement les informations externes lorsque tu t'appuies dessus (ajoute un lien si possible).",
      ].join("\n"),
    },
    {
      role: "user" as const,
      content: [
        `Sujet : ${context.thread.title}`,
        `Résumé rapide : ${context.summary}`,
        "Points clés récents :",
        highlights || "- (aucun)",
        "",
        "Historique (du plus ancien au plus récent) :",
        historyText || "Pas de réponses précédentes.",
        "",
        "Informations externes :",
        externalText,
        "",
        "Rédige ta contribution en Markdown en ajoutant de la valeur au débat. Termine éventuellement par une question ou une ouverture.",
      ].join("\n"),
    },
  ];
}

function buildSummaryMessages(
  persona: Prisma.AgentPersonaGetPayload<{ include: { schedules: true } }>,
  context: NonNullable<Awaited<ReturnType<typeof buildReplyContext>>>,
) {
  return [
    {
      role: "system" as const,
      content: [
        persona.systemPrompt,
        "Tu es un facilitateur chargé de résumer un fil pour les membres qui arrivent en cours de route.",
        "Produis un résumé concis (150 à 220 mots) en Markdown : un titre, des puces principales, une section 'À surveiller' si nécessaire.",
      ].join("\n"),
    },
    {
      role: "user" as const,
      content: [
        `Sujet : ${context.thread.title}`,
        `Résumé rapide : ${context.summary}`,
        "Historique :",
        context.history
          .map((entry) => {
            const speaker =
              entry.agentPersona?.displayName ??
              entry.author?.profile?.displayName ??
              entry.author?.username ??
              "Membre";
            return `${speaker} (${entry.createdAt.toISOString()}) : ${truncateText(entry.content, 260)}`;
          })
          .join("\n"),
      ].join("\n\n"),
    },
  ];
}

function buildInitiativePrompt(
  persona: Prisma.AgentPersonaGetPayload<{ include: { schedules: true } }>,
  initiative: Awaited<ReturnType<typeof buildInitiativeContext>>,
) {
  return [
    {
      role: "system" as const,
      content: [
        persona.systemPrompt,
        "Tu dois proposer un nouveau sujet de discussion pour le forum.",
        "Réponds impérativement en JSON strict : {\"title\": \"...\", \"content\": \"...\"}.",
        "Le contenu doit être rédigé en Markdown riche (introduction, contexte, questions ouvertes, éventuelles références).",
      ].join("\n"),
    },
    {
      role: "user" as const,
      content: [
        `Mots-clés du domaine : ${initiative.keywords.join(", ")}`,
        "Inspiration web :",
        initiative.inspiration
          .map((item) => `- ${item.title} (${item.url}) : ${truncateText(item.snippet || item.content || "", 200)}`)
          .join("\n"),
        "Propose un sujet original, sourcé, invitant la communauté à débattre.",
      ].join("\n\n"),
    },
  ];
}

type ThreadBlueprint = {
  title: string;
  content: string;
};

function parseThreadBlueprint(content: string): ThreadBlueprint | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]) as { title?: string; content?: string };
    if (!parsed.title || !parsed.content) {
      return null;
    }
    return { title: parsed.title, content: parsed.content };
  } catch (error) {
    console.warn("[agents] parseThreadBlueprint error", error);
    return null;
  }
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

// Fonction pour faciliter les tests de plages horaires en mode développement
function getCurrentDateForSchedules() {
  // Option de développement: pour tester les plages horaires, décommenter et définir une heure spécifique
  // return new Date('2025-10-17T22:30:00Z'); // Simule 22h30 UTC (00h30 à Paris)
  
  return new Date(); // Heure réelle
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

  const now = getCurrentDateForSchedules();
  
  // Log pour le débogage
  console.log("[agents] Vérification des plages horaires:", {
    nowUTC: now.toISOString(),
    weekdayUTC: now.getUTCDay()
  });

  return persona.schedules.find((schedule) => {
    if (!schedule.activeDays) return false;
    try {
      // Convertir en timezone locale pour vérifier le jour de la semaine
      const localeNow = toTimezone(now, schedule.timezone);
      const weekday = localeNow.getDay(); // Le jour de la semaine local, pas UTC
      
      // Analyser activeDays selon son type
      const activeDays =
        typeof schedule.activeDays === "string"
          ? JSON.parse(schedule.activeDays)
          : schedule.activeDays;
          
      if (!Array.isArray(activeDays)) return false;
      
      // Log de débogage pour cette plage
      console.log("[agents] Vérification plage:", {
        label: (schedule as any).label || "Plage sans nom",
        timezone: schedule.timezone,
        weekdayLocal: weekday,
        activeDays,
        isActiveDayMatch: activeDays.includes(weekday),
        windowHours: `${schedule.windowStart} - ${schedule.windowEnd}`
      });
      
      // Vérifier si le jour actuel (dans le fuseau de la plage) est un jour actif
      if (!activeDays.includes(weekday)) return false;

      // Convertir les heures de début et fin en minutes
      const [startHour, startMinute] = schedule.windowStart.split(":").map(Number);
      const [endHour, endMinute] = schedule.windowEnd.split(":").map(Number);
      
      // Minutes actuelles (dans le fuseau de la plage)
      const minutes = localeNow.getHours() * 60 + localeNow.getMinutes();
      const start = startHour * 60 + startMinute;
      let end = endHour * 60 + endMinute;
      
      // Gérer le cas où la plage horaire passe minuit (fin < début)
      if (end < start) {
        // Si l'heure de fin est avant l'heure de début, cela signifie qu'elle passe par minuit
        // Dans ce cas, soit l'heure actuelle est après l'heure de début, soit avant l'heure de fin
        return minutes >= start || minutes <= end;
      } else {
        // Cas normal : l'heure actuelle doit être entre l'heure de début et l'heure de fin
        return minutes >= start && minutes <= end;
      }
    } catch (err) {
      console.error("[agents] Erreur lors de la vérification de plage horaire:", err);
      return false;
    }
  });
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

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}
