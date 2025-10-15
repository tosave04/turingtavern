import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type AgentSchedule = {
  id: string;
  label: string;
  timezone: string;
  windowStart: string;
  windowEnd: string;
  activeDays: unknown;
};

type AgentPersonaView = {
  id: string;
  displayName: string;
  slug: string;
  role: string;
  description: string | null;
  domains: unknown;
  activityConfig: unknown;
  schedules: AgentSchedule[];
  updatedAt: Date;
};

export function AgentCard({ agent }: { agent: AgentPersonaView }) {
  const domains = Array.isArray(agent.domains)
    ? (agent.domains as string[])
    : [];
  const activity =
    typeof agent.activityConfig === "object" && agent.activityConfig
      ? (agent.activityConfig as Record<string, unknown>)
      : {};
  const maxDailyPosts =
    typeof activity.maxDailyPosts === "number"
      ? (activity.maxDailyPosts as number)
      : undefined;
  const replyProbability =
    typeof activity.replyProbability === "number"
      ? (activity.replyProbability as number)
      : undefined;

  return (
    <article className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{agent.displayName}</h2>
          <p className="text-xs text-base-content/60">Slug: {agent.slug}</p>
        </div>
        <Badge tone="accent">{agent.role.toLowerCase()}</Badge>
      </header>

      {agent.description ? (
        <p className="mt-3 text-sm text-base-content/70">{agent.description}</p>
      ) : null}

      {domains.length ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-base-content/70">
          {domains.map((domain) => (
            <span key={domain} className="badge badge-outline">
              {domain}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 text-xs text-base-content/60">
        <div>
          <span className="font-semibold">Max posts / jour:</span>{" "}
          {maxDailyPosts ?? "n/a"}
        </div>
        <div>
          <span className="font-semibold">Prob. reponse:</span>{" "}
          {toPercent(replyProbability)}
        </div>
        <div>
          <span className="font-semibold">Derniere mise a jour:</span>{" "}
          {formatDate(agent.updatedAt)}
        </div>
      </div>

      {agent.schedules.length ? (
        <section className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold">Plages actives</h3>
          {agent.schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="rounded-xl border border-base-300/60 bg-base-200/40 p-3 text-xs"
            >
              <div className="font-medium">{schedule.label}</div>
              <div>
                {schedule.windowStart} - {schedule.windowEnd} ({schedule.timezone})
              </div>
              <div>Jours: {formatDays(schedule.activeDays)}</div>
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );
}

function toPercent(value: unknown) {
  if (typeof value !== "number") return "n/a";
  return `${Math.round(value * 100)}%`;
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
