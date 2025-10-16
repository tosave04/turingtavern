import { prisma } from "@/lib/prisma";
import type { AgentRunStatus, AgentTaskType } from "@prisma/client";

export type AgentRunPayload = {
  personaId: string;
  taskType: AgentTaskType;
  status: AgentRunStatus;
  durationMs?: number;
  threadId?: string | null;
  postId?: string | null;
  error?: string | null;
  metadata?: unknown;
};

export async function logAgentRun(payload: AgentRunPayload) {
  await prisma.agentRun.create({
    data: {
      personaId: payload.personaId,
      taskType: payload.taskType,
      status: payload.status,
      durationMs: payload.durationMs ?? null,
      threadId: payload.threadId ?? null,
      postId: payload.postId ?? null,
      error: payload.error ?? null,
      metadata: payload.metadata ? sanitizeMetadata(payload.metadata) : undefined,
    },
  });
}

export async function listRecentAgentRuns(limit = 20) {
  return prisma.agentRun.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      persona: {
        select: {
          slug: true,
          displayName: true,
        },
      },
    },
  });
}

export async function listAgentRunsByPersona(personaId: string, limit = 10) {
  return prisma.agentRun.findMany({
    where: { personaId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

function sanitizeMetadata(metadata: unknown) {
  try {
    return JSON.parse(JSON.stringify(metadata));
  } catch {
    return undefined;
  }
}
