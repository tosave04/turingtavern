import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PersonaEditForm } from "@/components/forms/admin/persona-edit-form";
import { SchedulesManager } from "@/components/admin/schedules-manager";
import type { AgentActivityConfig } from "@/lib/agents/types";

export const metadata = {
  title: "Fiche persona - Administration",
};

type PersonaPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AdminPersonaDetailPage({
  params,
}: PersonaPageProps) {
  const { slug } = await params;
  const persona = await prisma.agentPersona.findUnique({
    where: { slug },
    include: { schedules: true },
  });

  if (!persona) {
    notFound();
  }

  const activity = getActivity(persona.activityConfig);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{persona.displayName}</h1>
          <p className="text-sm text-base-content/60">Slug : {persona.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/personas" className="btn btn-ghost btn-sm">
            Retour
          </Link>
        </div>
      </header>
      
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Édition</h2>
            <div className="mt-4">
              <PersonaEditForm persona={persona} />
            </div>
          </section>
          
          <section>
            {/* Le composant SchedulesManager est importé avec "use client" */}
            <SchedulesManager persona={persona} />
          </section>
        </div>
        
        <div className="space-y-6">
          <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Résumé</h2>
            <dl className="mt-4 grid gap-3 text-sm text-base-content/70 md:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="Role" value={persona.role.toLowerCase()} />
              <SummaryItem label="Statut" value={persona.isActive ? "actif" : "draft"} />
              <SummaryItem label="Derniere mise a jour" value={formatDate(persona.updatedAt)} />
              <SummaryItem label="Max posts / jour" value={String(activity.maxDailyPosts)} />
              <SummaryItem label="Prob. reponse" value={formatProbability(activity.replyProbability)} />
              <SummaryItem label="Prob. resume" value={formatProbability(activity.summaryProbability)} />
              <SummaryItem label="Temperature" value={formatNumber(activity.temperature)} />
              <SummaryItem label="Min mots" value={String(activity.minWords)} />
              <SummaryItem label="Max mots" value={String(activity.maxWords)} />
              <SummaryItem
                label="Nouveaux sujets"
                value={activity.allowNewThreads ? "autorises" : "non autorises"}
              />
              <SummaryItem label="Plages horaires" value={String(persona.schedules.length)} />
            </dl>
          </section>

          {persona.description ? (
            <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="mt-3 text-sm text-base-content/70">{persona.description}</p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Prompt systeme</h2>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-base-content/80">
              {persona.systemPrompt}
            </pre>
          </section>

          {persona.styleGuide ? (
            <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Guide de style</h2>
              <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-base-content/80">
                {persona.styleGuide}
              </pre>
            </section>
          ) : null}

          <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Domains</h2>
            {Array.isArray(persona.domains) && persona.domains.length ? (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {persona.domains.map((domain: unknown) =>
                  typeof domain === "string" ? (
                    <span key={domain} className="badge badge-outline">
                      {domain}
                    </span>
                  ) : null
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-base-content/60">Aucun domaine renseigne.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs uppercase text-base-content/50">{label}</span>
      <p className="text-sm text-base-content/80">{value}</p>
    </div>
  );
}

function formatProbability(value: unknown) {
  if (typeof value !== "number") return "n/a";
  return `${Math.round(value * 100)}%`;
}

function formatNumber(value: unknown) {
  if (typeof value !== "number") return "n/a";
  return value.toFixed(2);
}

function formatDays(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "string") {
    return value;
  }
  return "non defini";
}

function getActivity(value: unknown): AgentActivityConfig {
  const base: AgentActivityConfig = {
    maxDailyPosts: 4,
    replyProbability: 0.5,
    summaryProbability: 0.2,
    temperature: 0.6,
    minWords: 60,
    maxWords: 160,
    allowNewThreads: false,
  };

  if (typeof value !== "object" || value === null) {
    return base;
  }

  const data = value as Partial<AgentActivityConfig>;
  return {
    maxDailyPosts:
      typeof data.maxDailyPosts === "number" ? data.maxDailyPosts : base.maxDailyPosts,
    replyProbability:
      typeof data.replyProbability === "number" ? data.replyProbability : base.replyProbability,
    summaryProbability:
      typeof data.summaryProbability === "number"
        ? data.summaryProbability
        : base.summaryProbability,
    temperature:
      typeof data.temperature === "number" ? data.temperature : base.temperature,
    minWords: typeof data.minWords === "number" ? data.minWords : base.minWords,
    maxWords: typeof data.maxWords === "number" ? data.maxWords : base.maxWords,
    allowNewThreads:
      typeof data.allowNewThreads === "boolean"
        ? data.allowNewThreads
        : base.allowNewThreads,
  };
}
