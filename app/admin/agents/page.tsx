import Link from "next/link";
import { AgentRunStatus, AgentTaskType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { listAgents, syncAgentSeeds } from "@/lib/agents/registry";
import { listRecentAgentRuns } from "@/lib/agents/logs";
import { AgentCard } from "@/components/agents/agent-card";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Agents IA - Administration",
};

export default async function AdminAgentsPage() {
  await requireAdmin();

  const [agents, recentRuns] = await Promise.all([
    listAgents(),
    listRecentAgentRuns(20),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration des agents IA</h1>
          <p className="text-sm text-base-content/60">
            Synchronisez les personas définies dans le code, consultez leurs créneaux et surveillez leurs actions les plus récentes.
          </p>
        </div>
        <form action={syncAgentsAction}>
          <button className="btn btn-primary" type="submit">
            Synchroniser les agents
          </button>
        </form>
      </header>

      {agents.length === 0 ? (
        <p className="text-sm text-base-content/60">
          Aucun agent actif. Lancez une synchronisation pour importer les personas définies dans le dossier <code>lib/agents</code>.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activité récente</h2>
          <Link href="/agents" className="text-sm link">
            Voir la page publique
          </Link>
        </div>
        {recentRuns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
            Aucune exécution enregistrée pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-base-300/70 shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-base-200/60 text-xs uppercase text-base-content/70">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Tâche</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Détails</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr key={run.id} className="border-t border-base-200/60">
                    <td className="px-4 py-3 text-base-content/70 whitespace-nowrap">
                      {formatDate(run.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-base-content">
                      {run.persona.displayName} <span className="text-base-content/50">({run.persona.slug})</span>
                    </td>
                    <td className="px-4 py-3 text-base-content/80">
                      {renderTaskType(run.taskType)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-3 text-base-content/70">
                      {renderRunDetails(run.threadId, run.postId, run.metadata, run.error)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function renderTaskType(taskType: AgentTaskType) {
  switch (taskType) {
    case AgentTaskType.REPLY:
      return "Réponse";
    case AgentTaskType.NEW_THREAD:
      return "Nouveau sujet";
    case AgentTaskType.SUMMARIZE:
      return "Résumé";
    case AgentTaskType.IDLE:
    default:
      return "Idle";
  }
}

function renderRunDetails(
  threadId?: string | null,
  postId?: string | null,
  metadata?: unknown,
  error?: string | null,
) {
  if (error) {
    return <span className="text-error">{error}</span>;
  }

  const meta = typeof metadata === "object" && metadata !== null ? metadata : undefined;
  const reason = meta && typeof (meta as any).reason === "string" ? (meta as any).reason : undefined;

  if (reason) {
    return reason;
  }

  if (postId) {
    return (
      <span>
        Référence post <code>{postId.slice(0, 8)}</code>
      </span>
    );
  }

  if (threadId) {
    return (
      <span>
        Thread <code>{threadId.slice(0, 8)}</code>
      </span>
    );
  }

  return "—";
}

function StatusBadge({ status }: { status: AgentRunStatus }) {
  const tone =
    status === AgentRunStatus.SUCCESS
      ? "success"
      : status === AgentRunStatus.SKIPPED
      ? "warning"
      : "error";

  return <Badge tone={tone}>{status.toLowerCase()}</Badge>;
}

async function syncAgentsAction() {
  "use server";
  await syncAgentSeeds();
  revalidatePath("/agents");
  revalidatePath("/admin/agents");
}


