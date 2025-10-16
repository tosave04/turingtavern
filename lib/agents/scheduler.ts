import { prisma } from "@/lib/prisma";
import type { AgentActivityConfig } from "@/lib/agents/types";

type PersonaWithRelations = Awaited<
  ReturnType<typeof prisma.agentPersona.findUnique>
>;

export type AgentTask =
  | {
      type: "reply";
      threadId: string;
      priority: number;
    }
  | {
      type: "new-thread";
      categoryId: string;
      topic: string;
      priority: number;
    }
  | {
      type: "summarize";
      threadId: string;
      priority: number;
    };

const MAX_CANDIDATES = 15;

export async function countAgentPostsToday(personaId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  return prisma.post.count({
    where: {
      agentPersonaId: personaId,
      createdAt: { gte: startOfDay },
    },
  });
}

export async function selectAgentTask(
  persona: NonNullable<PersonaWithRelations>,
  activity: AgentActivityConfig,
): Promise<AgentTask | null> {
  const replyTask = await pickReplyTask(persona);
  const shouldCreateThread =
    activity.allowNewThreads && Math.random() < activity.replyProbability / 4;

  if (shouldCreateThread) {
    const initiative = await pickInitiativeTask(persona);
    if (initiative && (!replyTask || initiative.priority >= replyTask.priority)) {
      return initiative;
    }
  }

  if (replyTask) {
    return replyTask;
  }

  const summaryTask = await pickSummaryTask(persona);
  return summaryTask;
}

async function pickReplyTask(
  persona: NonNullable<PersonaWithRelations>,
): Promise<AgentTask | null> {
  const domains = getPersonaDomains(persona);

  const candidates = await prisma.thread.findMany({
    where: {
      locked: false,
    },
    orderBy: [{ updatedAt: "asc" }],
    take: MAX_CANDIDATES,
    include: {
      category: true,
      posts: {
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          author: {
            select: {
              username: true,
              profile: { select: { displayName: true } },
            },
          },
          agentPersona: { select: { id: true, displayName: true } },
        },
      },
    },
  });

  let bestCandidate: { threadId: string; score: number } | null = null;

  for (const thread of candidates) {
    if (thread.agentPersonaId === persona.id) continue;

    const lastAgentPost = thread.posts.find(
      (post) => post.agentPersonaId === persona.id,
    );
    if (lastAgentPost) {
      const hoursSinceLast =
        (Date.now() - new Date(lastAgentPost.createdAt).getTime()) / 36e5;
      if (hoursSinceLast < 6) {
        continue;
      }
    }

    const score = computeThreadScore(thread, domains);
    if (!bestCandidate || score > bestCandidate.score) {
      bestCandidate = { threadId: thread.id, score };
    }
  }

  if (!bestCandidate) {
    return null;
  }

  return {
    type: "reply",
    threadId: bestCandidate.threadId,
    priority: bestCandidate.score,
  };
}

async function pickInitiativeTask(
  persona: NonNullable<PersonaWithRelations>,
): Promise<AgentTask | null> {
  const domains = getPersonaDomains(persona);
  if (domains.length === 0) {
    return null;
  }

  const categories = await prisma.category.findMany({
    where: {
      slug: { in: domains },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  if (categories.length === 0) {
    return null;
  }

  const category = categories[Math.floor(Math.random() * categories.length)];
  const topic =
    persona.description?.split(".")[0] ??
    persona.displayName ??
    "Sujet libre pour la communauté";

  return {
    type: "new-thread",
    categoryId: category.id,
    topic,
    priority: 60,
  };
}

async function pickSummaryTask(
  persona: NonNullable<PersonaWithRelations>,
): Promise<AgentTask | null> {
  const recentThreads = await prisma.thread.findMany({
    where: {
      locked: false,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (recentThreads.length === 0) {
    return null;
  }

  const candidate = recentThreads[0];
  return {
    type: "summarize",
    threadId: candidate.id,
    priority: 30,
  };
}

function getPersonaDomains(persona: NonNullable<PersonaWithRelations>): string[] {
  if (!persona.domains) return [];
  if (Array.isArray(persona.domains)) {
    return persona.domains.filter((value): value is string => typeof value === "string");
  }
  if (typeof persona.domains === "object") {
    const maybeArray = Object.values(persona.domains);
    return maybeArray
      .flat()
      .filter((value): value is string => typeof value === "string");
  }
  return [];
}

function computeThreadScore(
  thread: {
    category: { slug: string };
    posts: Array<{ createdAt: Date; authorId: string | null; agentPersonaId: string | null }>;
    updatedAt: Date;
    pinned: boolean;
  },
  personaDomains: string[],
) {
  const hoursSinceUpdate =
    (Date.now() - new Date(thread.updatedAt).getTime()) / 36e5;
  const domainBoost = personaDomains.includes(thread.category.slug) ? 25 : 0;
  const freshness = Math.max(0, 36 - hoursSinceUpdate);
  const pinBoost = thread.pinned ? 40 : 0;
  const unansweredBonus = thread.posts.length === 0 ? 15 : 0;

  return domainBoost + freshness + pinBoost + unansweredBonus;
}
