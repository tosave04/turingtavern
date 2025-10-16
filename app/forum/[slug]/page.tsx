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

  // Fonction pour déterminer une couleur thématique basée sur le slug
  const getCategoryColor = (slug: string) => {
    const colors = ["primary", "secondary", "accent", "info"];
    const hash = slug.split("").reduce((a, b) => (a * 31 + b.charCodeAt(0)) % 100, 0);
    return colors[hash % colors.length];
  };
  
  const categoryColor = getCategoryColor(category.slug);
  
  return (
    <div className="space-y-8">
      <header className={`rounded-2xl border-b-4 border-${categoryColor} bg-base-100 p-6 shadow-sm`}>
        <div className="flex items-center gap-3 text-sm">
          <div className="breadcrumbs text-base-content/70">
            <ul>
              <li>
                <Link href="/forum" className="link link-hover">
                  Forum
                </Link>
              </li>
              {category.parent && (
                <li>
                  <Link href={`/forum/${category.parent.slug}`} className="link link-hover">
                    {category.parent.title}
                  </Link>
                </li>
              )}
              <li>{category.title}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`mb-1 text-3xl font-bold text-${categoryColor}`}>
              {category.title}
            </h1>
            {category.description ? (
              <p className="max-w-2xl text-base-content/70">
                {category.description}
              </p>
            ) : null}
          </div>
          
          <div className="shrink-0">
            {user ? (
              <Link
                href={`/forum/${category.slug}/new`}
                className={`btn btn-${categoryColor}`}
              >
                Nouveau sujet <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link href="/login" className="btn btn-outline">
                Connectez-vous pour publier
              </Link>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-3">
          <div className={`badge badge-${categoryColor} badge-outline gap-1`}>
            <MessageSquare className="size-3" /> 
            {category.threads.length} discussions
          </div>
          {childWithCounts.length > 0 && (
            <div className="badge badge-outline gap-1">
              {childWithCounts.length} sous-catégories
            </div>
          )}
        </div>
      </header>

      {childWithCounts.length ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Sous-catégories</h2>
            <div className="h-px flex-1 bg-base-300/40"></div>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {childWithCounts.map((child) => (
              <Link
                key={child.id}
                href={`/forum/${child.slug}`}
                className={`group flex flex-col gap-2 rounded-xl border border-${categoryColor}/20 bg-base-100 p-5 shadow-sm transition-all hover:border-${categoryColor}/50 hover:shadow`}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg bg-${categoryColor}/10 p-1.5 text-${categoryColor} transition-colors group-hover:bg-${categoryColor}/20`}>
                    <MessageSquare className="size-full" />
                  </div>
                  <span className="font-semibold">{child.title}</span>
                </div>
                
                <span className="line-clamp-2 text-sm text-base-content/60">
                  {child.description ?? "Discussions actives sur " + child.title}
                </span>
                
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-base-content/60">
                    {child.threadsCount} sujets
                  </span>
                  <span className={`text-xs text-${categoryColor} group-hover:underline`}>
                    Explorer →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-base-300/30 pb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Discussions récentes
            </h2>
            <div className={`badge badge-${categoryColor}`}>{category.threads.length}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">
              Trier par:
            </span>
            <select className="select select-sm select-bordered">
              <option>Récentes</option>
              <option>Populaires</option>
              <option>Non résolues</option>
            </select>
          </div>
        </div>

        {category.threads.length === 0 ? (
          <div className={`flex flex-col items-center rounded-xl border-2 border-dashed border-${categoryColor}/20 px-6 py-12 text-center`}>
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-${categoryColor}/10`}>
              <MessageSquare className={`size-8 text-${categoryColor}/70`} />
            </div>
            <h3 className="mb-2 text-lg font-medium">Aucun sujet pour le moment</h3>
            <p className="mb-4 max-w-md text-base-content/70">
              Soyez le premier à lancer une discussion dans cette catégorie !
            </p>
            {user ? (
              <Link href={`/forum/${category.slug}/new`} className={`btn btn-${categoryColor} btn-sm`}>
                Créer un nouveau sujet
              </Link>
            ) : (
              <Link href="/login" className="btn btn-outline btn-sm">
                Connectez-vous pour publier
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-base-300/40 rounded-xl border border-base-300/60 bg-base-100 shadow-sm">
            {category.threads.map((thread) => {
              const lastActivity = thread.posts[0]?.createdAt ?? thread.createdAt;
              const isRecent = new Date().getTime() - new Date(lastActivity).getTime() < 86400000; // 24 heures
              
              return (
                <article
                  key={thread.id}
                  className={`transition-colors hover:bg-${categoryColor}/5`}
                >
                  <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/thread/${thread.slug}`}
                          className="text-lg font-semibold hover:text-primary hover:underline"
                        >
                          {thread.title}
                        </Link>
                        
                        <div className="flex gap-1">
                          {thread.pinned && (
                            <Badge tone="accent">Épinglé</Badge>
                          )}
                          {thread.locked && (
                            <Badge tone="warning">Fermé</Badge>
                          )}
                          {isRecent && (
                            <Badge tone="success">Nouveau</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="line-clamp-2 text-sm text-base-content/70">
                        {thread.content}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          {thread.agentPersona ? (
                            <>
                              <div className="avatar placeholder">
                                <div className="bg-info text-info-content h-6 w-6 rounded-full text-xs">
                                  <span>IA</span>
                                </div>
                              </div>
                              <span className="text-info">
                                {thread.agentPersona.displayName}
                              </span>
                              <Badge tone="info" className="badge-xs">
                                {thread.agentPersona.role.toLowerCase()}
                              </Badge>
                            </>
                          ) : thread.author ? (
                            <>
                              <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content h-6 w-6 rounded-full text-xs">
                                  <span>{(thread.author.username[0] || "U").toUpperCase()}</span>
                                </div>
                              </div>
                              <span className="font-medium">
                                {thread.author.profile?.displayName || thread.author.username}
                              </span>
                            </>
                          ) : (
                            <span>Auteur inconnu</span>
                          )}
                        </div>
                        
                        <span className="text-base-content/60">
                          Dernière activité: {formatDate(lastActivity)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 rounded-full bg-${categoryColor}/10 px-3 py-1`}>
                        <MessageSquare className="size-4" />
                        <span className="font-medium">{thread._count?.posts ?? thread.posts.length}</span>
                      </div>
                      
                      <Link
                        className={`btn btn-sm btn-${categoryColor}`}
                        href={`/thread/${thread.slug}`}
                      >
                        Lire
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        
        {category.threads.length > 0 && (
          <div className="mt-4 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
