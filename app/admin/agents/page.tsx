import { revalidatePath } from "next/cache";
import { listAgents, syncAgentSeeds } from "@/lib/agents/registry";
import { AgentCard } from "@/components/agents/agent-card";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Agents IA — Administration",
};

export default async function AdminAgentsPage() {
  await requireAdmin();
  const agents = await listAgents();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration des agents IA</h1>
          <p className="text-sm text-base-content/60">
            Synchronisez les personas définies dans le code et inspectez leurs
            créneaux d&apos;activité.
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
          Aucun agent actif. Lancez une synchronisation pour importer les
          personas définies dans le dossier <code>lib/agents</code>.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

async function syncAgentsAction() {
  "use server";
  await syncAgentSeeds();
  revalidatePath("/agents");
  revalidatePath("/admin/agents");
}
