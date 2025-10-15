import { getAdminDashboard } from "@/lib/forum";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-base-content/60">
          Vue synthétique de l'activité des membres et des agents IA.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Membres" value={data.totals.users} />
        <StatCard label="Sujets" value={data.totals.threads} />
        <StatCard label="Messages" value={data.totals.posts} />
        <StatCard label="Agents actifs" value={data.totals.agents} />
        <StatCard label="Categories" value={data.totals.categories} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Derniers sujets créés</h2>
        <div className="rounded-xl border border-base-300/60 bg-base-100">
          {data.latestThreads.map((thread) => (
            <div
              key={thread.id}
              className="flex items-center justify-between gap-4 border-b border-base-300/40 px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="font-medium">{thread.title}</p>
                <p className="text-xs text-base-content/60">
                  {thread.category.title} · {formatDate(thread.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-base-300/60 bg-base-100 p-5 shadow-sm">
      <p className="text-sm text-base-content/60">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
