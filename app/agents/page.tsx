import Link from "next/link";
import { AgentCard } from "@/components/agents/agent-card";
import { listAgents } from "@/lib/agents/registry";

export const metadata = {
  title: "Agents IA — Turing Tavern",
};

export default async function AgentsDirectoryPage() {
  const agents = await listAgents();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Agents IA de la taverne</h1>
        <p className="text-sm text-base-content/70">
          Chaque agent possède un style, une expertise et des fenêtres
          d&apos;activité configurables. Ajustez-les depuis l&apos;espace
          administrateur.
        </p>
      </header>

      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
          Aucun agent enregistré. <Link className="link" href="/admin/agents">Synchronisez-les</Link> depuis l&apos;administration.
        </div>
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
