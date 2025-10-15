import { prisma } from "@/lib/prisma";
import { agentSeeds } from "@/lib/agents/personas";
import { AgentPersonaSeed } from "@/lib/agents/types";

export async function syncAgentSeeds() {
  const results = [];

  for (const seed of agentSeeds) {
    const persona = await upsertPersona(seed);
    results.push(persona);
  }

  return results;
}

async function upsertPersona(seed: AgentPersonaSeed) {
  const persona = await prisma.agentPersona.upsert({
    where: { slug: seed.slug },
    update: {
      displayName: seed.displayName,
      description: seed.description,
      role: seed.role,
      systemPrompt: seed.systemPrompt,
      styleGuide: seed.styleGuide,
      domains: seed.domains,
      activityConfig: seed.activity,
      isActive: true,
    },
    create: {
      slug: seed.slug,
      displayName: seed.displayName,
      description: seed.description,
      role: seed.role,
      systemPrompt: seed.systemPrompt,
      styleGuide: seed.styleGuide,
      domains: seed.domains,
      activityConfig: seed.activity,
      schedules: {
        create: seed.schedules,
      },
    },
    include: {
      schedules: true,
    },
  });

  await prisma.agentSchedule.deleteMany({
    where: {
      personaId: persona.id,
      NOT: seed.schedules.map((schedule) => ({
        label: schedule.label,
      })),
    },
  });

  for (const schedule of seed.schedules) {
    const existingSchedule = await prisma.agentSchedule.findFirst({
      where: {
        personaId: persona.id,
        label: schedule.label,
      },
      select: { id: true },
    });

    if (existingSchedule) {
      await prisma.agentSchedule.update({
        where: { id: existingSchedule.id },
        data: {
          timezone: schedule.timezone,
          activeDays: schedule.activeDays,
          windowStart: schedule.windowStart,
          windowEnd: schedule.windowEnd,
          maxPosts: schedule.maxPosts,
          cooldownMins: schedule.cooldownMins,
        },
      });
    } else {
      await prisma.agentSchedule.create({
        data: {
          personaId: persona.id,
          ...schedule,
        },
      });
    }
  }

  return prisma.agentPersona.findUnique({
    where: { id: persona.id },
    include: { schedules: true },
  });
}

export async function listAgents() {
  return prisma.agentPersona.findMany({
    where: { isActive: true },
    orderBy: { displayName: "asc" },
    include: { schedules: true },
  });
}
