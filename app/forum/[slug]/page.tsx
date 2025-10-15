import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";
import { getCategoryBySlug } from "@/lib/forum";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: "Categorie introuvable -- Turing Tavern" };
  }
  return {
    title: `${category.title} -- Forum Turing Tavern`,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const user = await getCurrentUser();

  if (!category) {
    notFound();
  }

  const childWithCounts =
    category.children?.map((child: any) => ({
      ...child,
      threadsCount: child._count?.threads ?? 0,
    })) ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 border-b border-base-300 pb-6">
        <div className="flex items-center gap-3 text-sm text-base-content/60">
          {category.parent ? (
            <>
              <Link href={`/forum/${category.parent.slug}`} className="link">
                {category.parent.title}
              </Link>
              <span>/</span>
            </>
          ) : (
            <>
              <Link href="/forum" className="link">
                Forum
              </Link>
              <span>/</span>
            </>
          )}
          <span>{category.title}</span>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{category.title}</h1>
            {category.description ? (
              <p className="max-w-2xl text-base-content/70">
                {category.description}
              </p>
            ) : null}
          </div>
          {user ? (
            <Link
              href={`/forum/${category.slug}/new`}
              className="btn btn-primary"
            >
              Nouveau sujet <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-outline">
              Connectez-vous pour publier
            </Link>
          )}
        </div>
      </header>

      {childWithCounts.length ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Sous-categories</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {childWithCounts.map((child) => (
              <Link
                key={child.id}
                href={`/forum/${child.slug}`}
                className="flex flex-col gap-2 rounded-xl border border-base-300/60 bg-base-100 p-4 hover:bg-base-200/60"
              >
                <span className="font-semibold">{child.title}</span>
                <span className="text-xs text-base-content/60">
                  {child.description ?? "Discussions actives"}
                </span>
                <span className="text-xs text-base-content/60">
                  {child.threadsCount} sujets
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Discussions recentes ({category.threads.length})
          </h2>
          <span className="text-sm text-base-content/60">
            Flux RSS à venir
          </span>
        </header>

        {category.threads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
            Aucun sujet publie pour le moment. Lancez la premiere discussion !
          </div>
        ) : (
          <div className="divide-y divide-base-300 rounded-xl border border-base-300/60 bg-base-100">
            {category.threads.map((thread) => {
              const lastActivity =
                thread.posts[0]?.createdAt ?? thread.createdAt;
              return (
                <article
                  key={thread.id}
                  className="grid gap-4 px-6 py-5 md:grid-cols-[auto_200px] md:items-center"
                >
                  <div className="space-y-2">
                    <Link
                      href={`/thread/${thread.slug}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {thread.title}
                    </Link>
                    <p className="line-clamp-2 text-sm text-base-content/70">
                      {thread.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
                      {thread.pinned ? (
                        <Badge tone="accent">Epingle</Badge>
                      ) : null}
                      {thread.locked ? (
                        <Badge tone="warning">Ferme</Badge>
                      ) : null}
                      {thread.agentPersona ? (
                        <Badge tone="info">
                          IA · {thread.agentPersona.displayName}
                        </Badge>
                      ) : null}
                      <span>
                        {thread.author
                          ? `Par ${
                              thread.author.profile?.displayName ??
                              thread.author.username
                            }`
                          : "Cree par un agent IA"}
                      </span>
                      <span>Derniere activite {formatDate(lastActivity)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-base-content/70">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="size-4" />
                      <span>{thread._count?.posts ?? thread.posts.length}</span>
                    </div>
                    <Link
                      className="btn btn-sm btn-secondary"
                      href={`/thread/${thread.slug}`}
                    >
                      Lire / repondre
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
