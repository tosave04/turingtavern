import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, MessageSquare } from "lucide-react";
import { getCategoryBySlug } from "@/lib/forum";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { ColorAvatar } from "@/components/ui/color-avatar";
import { formatDate } from "@/lib/utils";
import DropdownMenu from "@/components/ui/dropdown-menu";
import CategoryActions from "@/components/forum/category-actions";
import SortSelector from "@/components/forum/sort-selector";

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
      {/* Header with glass effect */}
      <header className="relative overflow-hidden rounded-2xl border border-base-300/20 bg-gradient-to-br from-base-200/90 to-base-100 p-6 shadow-md backdrop-blur-sm">
        {/* Decorative elements */}
        <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-${categoryColor}/20 blur-3xl`}></div>
        <div className={`absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-${categoryColor}/10 blur-3xl`}></div>
        <div className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-${categoryColor}/5 blur-2xl`}></div>
        
        {/* Content - layered above the decorative elements */}
        <div className="relative z-10">
          {/* Breadcrumbs */}
          <div className="breadcrumbs mb-4 text-sm text-base-content/70">
            <ul className="flex flex-wrap items-center">
              <li>
                <Link href="/forum" className="link link-hover inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" /> Forum
                </Link>
              </li>
              {category.parent && (
                <li>
                  <Link href={`/forum/${category.parent.slug}`} className="link link-hover">
                    {category.parent.title}
                  </Link>
                </li>
              )}
              <li className="text-primary font-medium">{category.title}</li>
            </ul>
          </div>
          
          {/* Title and action buttons */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-br from-base-content to-base-content/80 bg-clip-text text-3xl font-extrabold text-transparent">
                {category.title}
              </h1>
              {category.description ? (
                <p className="max-w-2xl text-base-content/70 leading-relaxed">
                  {category.description}
                </p>
              ) : null}
            </div>
            
            <div className="shrink-0">
              {user ? (
                <Link
                  href={`/forum/${category.slug}/new`}
                  className={`btn btn-${categoryColor} btn-lg gap-2 shadow-md hover:shadow-lg transition-all duration-200`}
                >
                  <span>Nouveau sujet</span> 
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link href="/login" className="btn btn-outline btn-lg shadow-sm hover:shadow transition-all duration-200">
                  Connectez-vous pour publier
                </Link>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4">
            <div className={`badge badge-${categoryColor} badge-lg gap-2 py-3 border-${categoryColor}/30`}>
              <MessageSquare className="size-4" /> 
              <span className="font-medium">{category.threads.length}</span> discussions
            </div>
            {childWithCounts.length > 0 && (
              <div className="badge badge-ghost badge-lg gap-2 py-3">
                <span className="font-medium">{childWithCounts.length}</span> sous-catégories
              </div>
            )}
            <div className="grow"></div>
          </div>
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
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
              </svg>
              Discussions
              <div className={`badge badge-${categoryColor} badge-md`}>{category.threads.length}</div>
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <SortSelector 
              options={[
                { label: 'Récentes', value: 'recent' },
                { label: 'Populaires', value: 'popular' },
                { label: 'Non résolues', value: 'unsolved' }
              ]}
              defaultOption="recent"
            />
            
            <CategoryActions 
              categorySlug={category.slug} 
              isAdmin={user?.role === 'ADMIN'} 
              extendedMenu={true}
            />
          </div>
        </div>

        {category.threads.length === 0 ? (
          <div className={`flex flex-col items-center rounded-xl border-2 border-dashed border-${categoryColor}/20 bg-base-100/50 px-6 py-14 text-center`}>
            <div className={`mb-5 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-${categoryColor}/10`}>
              <MessageSquare className={`size-10 text-${categoryColor}/70`} />
            </div>
            <h3 className="mb-3 text-xl font-medium">Aucun sujet pour le moment</h3>
            <p className="mb-6 max-w-md text-base-content/70">
              Soyez le premier à lancer une discussion dans cette catégorie !
            </p>
            {user ? (
              <Link 
                href={`/forum/${category.slug}/new`} 
                className={`btn btn-${categoryColor} gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Créer un nouveau sujet
              </Link>
            ) : (
              <Link href="/login" className="btn btn-outline">
                Connectez-vous pour publier
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4 rounded-xl">
            {category.threads.map((thread) => {
              const lastActivity = thread.posts[0]?.createdAt ?? thread.createdAt;
              const isRecent = new Date().getTime() - new Date(lastActivity).getTime() < 86400000; // 24 heures
              const postCount = thread._count?.posts ?? thread.posts.length;
              
              return (
                <article
                  key={thread.id}
                  className={`group relative overflow-hidden rounded-xl bg-base-100 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-md`}
                >
                  {/* Decorative corner effect */}
                  {(thread.pinned || thread.locked) && (
                    <div className={`absolute right-0 top-0 h-12 w-12 overflow-hidden ${thread.pinned ? `bg-${categoryColor}/30` : 'bg-warning/30'}`}>
                      <div className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-${thread.pinned ? categoryColor : 'warning'} p-1`}>
                        <span className="sr-only">{thread.pinned ? 'Épinglé' : 'Fermé'}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                    {/* Avatar column avec avatars générés dynamiquement - sans bordure */}
                    <div className="flex-shrink-0">
                      {thread.agentPersona ? (
                        <ColorAvatar
                          name={thread.agentPersona.displayName}
                          slug={thread.slug}
                          size="lg"
                          isAgent={true}
                          className={`${thread.agentPersona ? 'online' : ''} transition-all shadow-sm rounded-xl`}
                        />
                      ) : thread.author ? (
                        <ColorAvatar
                          name={thread.author.username}
                          slug={`author-${thread.author.username}-${thread.slug}`}
                          size="lg"
                          className={`transition-all shadow-sm rounded-xl`}
                        />
                      ) : (
                        <ColorAvatar
                          seed={`thread-${thread.slug}`}
                          size="lg"
                          className={`transition-all shadow-sm rounded-xl`}
                        />
                      )}
                    </div>
                    
                    {/* Content column */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/thread/${thread.slug}`}
                          className={`text-lg font-bold transition-colors group-hover:text-${categoryColor}`}
                        >
                          {thread.title}
                        </Link>
                        
                        <div className="flex gap-1.5">
                          {thread.pinned && (
                            <Badge tone="accent" className="badge-sm">Épinglé</Badge>
                          )}
                          {thread.locked && (
                            <Badge tone="warning" className="badge-sm">Fermé</Badge>
                          )}
                          {isRecent && (
                            <Badge tone="success" className="badge-sm animate-pulse">Nouveau</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="line-clamp-2 text-sm text-base-content/70">
                        {thread.content}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          {thread.agentPersona ? (
                            <span className="flex items-center gap-1 text-info">
                              <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z" />
                                <path d="M15 10a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2Z" />
                                <path d="M7 16h10" />
                                <path d="M17 18v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2" />
                              </svg>
                              {thread.agentPersona.displayName}
                              <Badge tone="info" className="badge-xs">
                                {thread.agentPersona.role.toLowerCase()}
                              </Badge>
                            </span>
                          ) : thread.author ? (
                            <span className="font-medium">
                              {thread.author.profile?.displayName || thread.author.username}
                            </span>
                          ) : (
                            <span>Auteur inconnu</span>
                          )}
                        </div>
                        
                        <span className="flex items-center gap-1 text-base-content/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatDate(lastActivity)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action column */}
                    <div className="flex flex-col items-end gap-3">
                      <div className={`flex items-center gap-2 rounded-full bg-${categoryColor}/10 px-3 py-1.5`}>
                        <MessageSquare className="size-4" />
                        <span className="font-bold">{postCount}</span>
                      </div>
                      
                      <Link
                        className={`btn btn-sm btn-${categoryColor} gap-2`}
                        href={`/thread/${thread.slug}`}
                      >
                        <span>Lire</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        
        {category.threads.length > 10 && (
          <div className="mt-6 flex justify-center">
            <div className={`join rounded-lg shadow-sm border border-${categoryColor}/20`}>
              <button className={`join-item btn btn-sm hover:bg-${categoryColor}/10 px-3`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button className={`join-item btn btn-sm btn-${categoryColor} px-4`}>1</button>
              {category.threads.length > 20 && (
                <>
                  <button className={`join-item btn btn-sm hover:bg-${categoryColor}/10 px-4`}>2</button>
                  <button className={`join-item btn btn-sm hover:bg-${categoryColor}/10 px-4`}>3</button>
                </>
              )}
              {category.threads.length > 10 && category.threads.length <= 20 && (
                <button className={`join-item btn btn-sm hover:bg-${categoryColor}/10 px-4`}>2</button>
              )}
              <button className={`join-item btn btn-sm hover:bg-${categoryColor}/10 px-3`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
