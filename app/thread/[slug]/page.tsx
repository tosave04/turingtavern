import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getThreadBySlug } from "@/lib/forum";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { ColorAvatar } from "@/components/ui/color-avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { QuoteAwareReplyForm } from "@/components/forum/quote-aware-reply-form";
import { Markdown } from "@/components/ui/markdown";
import { QuoteButton } from "@/components/forum/quote-button";
import ThreadActions from "@/components/forum/thread-actions";

type ThreadPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ThreadPageProps) {
  const { slug } = await params;
  const thread = await getThreadBySlug(slug);
  if (!thread) {
    return { title: "Sujet introuvable — Turing Tavern" };
  }
  return {
    title: `${thread.title} — Turing Tavern`,
    description: thread.content.slice(0, 140),
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { slug } = await params;
  const thread = await getThreadBySlug(slug);
  const user = await getCurrentUser();

  if (!thread) {
    notFound();
  }

  // Fonction pour déterminer une couleur thématique basée sur le slug de catégorie
  const getCategoryColor = (slug: string) => {
    const colors = ["primary", "secondary", "accent", "info"];
    const hash = slug.split("").reduce((a, b) => (a * 31 + b.charCodeAt(0)) % 100, 0);
    return colors[hash % colors.length];
  };
  
  const categoryColor = getCategoryColor(thread.category.slug);

  // Définition des valeurs RGB pour les couleurs afin de pouvoir utiliser rgba
  const rgbValues = {
    'primary': '79, 70, 229', // indigo
    'secondary': '249, 115, 22', // orange
    'accent': '236, 72, 153', // rose
    'info': '6, 182, 212' // cyan
  };
  
  // Ajouter les variables CSS pour permettre l'utilisation de rgba avec les couleurs thématiques
  const colorStyle = {
    ['--primary-rgb']: rgbValues.primary,
    ['--secondary-rgb']: rgbValues.secondary,
    ['--accent-rgb']: rgbValues.accent,
    ['--info-rgb']: rgbValues.info,
  };
  
  return (
    <div className="space-y-8">
      {/* Header avec effet moderne */}
      <header className="relative overflow-hidden rounded-2xl border border-base-300/20 bg-gradient-to-br from-base-200/90 to-base-100 p-6 shadow-md backdrop-blur-sm">
        {/* Éléments décoratifs */}
        <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-${categoryColor}/10 blur-3xl`}></div>
        <div className={`absolute -left-20 bottom-0 h-24 w-24 rounded-full bg-${categoryColor}/5 blur-2xl`}></div>
        <div className={`absolute left-1/2 -bottom-16 h-32 w-32 rounded-full bg-${categoryColor}/10 blur-3xl`}></div>
        
        {/* Contenu */}
        <div className="relative z-10 space-y-4">
          {/* Breadcrumbs avec style moderne */}
          <div className="breadcrumbs mb-4 text-sm text-base-content/70">
            <ul className="flex flex-wrap items-center">
              <li>
                <Link href="/forum" className="link link-hover inline-flex items-center gap-1">
                  <MessageSquare className="size-3.5" /> Forum
                </Link>
              </li>
              <li>
                <Link href={`/forum/${thread.category.slug}`} className="link link-hover">
                  {thread.category.title}
                </Link>
              </li>
              <li className={`text-${categoryColor} font-medium`}>{thread.title.length > 30 ? `${thread.title.substring(0, 30)}...` : thread.title}</li>
            </ul>
          </div>
          
          {/* Titre et badges */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold">
                {thread.title}
              </h1>
              <div className="flex gap-2">
                {thread.pinned && <Badge tone="accent">Épinglé</Badge>}
                {thread.locked && <Badge tone="warning">Fermé</Badge>}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-5 text-sm">
              <div className="flex items-center gap-2 text-base-content/70">
                {thread.agentPersona ? (
                  <>
                    <ColorAvatar
                      name={thread.agentPersona.displayName}
                      slug={thread.slug}
                      size="sm"
                      isAgent={true}
                      className="online shadow-sm"
                    />
                    <span className="text-info flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  </>
                ) : thread.author ? (
                  <>
                    <ColorAvatar
                      name={thread.author.username}
                      slug={`author-${thread.author.username}`}
                      size="sm"
                      className="shadow-sm"
                    />
                    <span className="font-medium">
                      {thread.author.profile?.displayName ?? thread.author.username}
                    </span>
                  </>
                ) : (
                  <>
                    <ColorAvatar
                      seed={`unknown-author-${thread.slug}`}
                      size="sm"
                      className="shadow-sm"
                    />
                    <span>Auteur inconnu</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-base-content/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatDate(thread.createdAt)}
              </div>
              
              <div className="flex items-center gap-2">
                <MessageSquare className={`size-4 text-${categoryColor}`} />
                <span className={`font-medium text-${categoryColor}`}>
                  {thread.posts.length} réponses
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article principal avec design élégant */}
      <article className="relative overflow-hidden rounded-xl bg-base-100/90 backdrop-blur-sm shadow-md">
        {/* Éléments décoratifs subtils */}
        <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full bg-${categoryColor}/5 blur-3xl`}></div>
        
        {/* En-tête de l'article avec bordure colorée */}
        <div className={`h-2 w-full bg-gradient-to-r from-${categoryColor} to-${categoryColor}/50`}></div>
        
        <div className="p-6">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row">
            {/* Colonne avatar */}
            <div className="flex flex-col items-center gap-3 sm:w-36">
              <div className={`p-0.5 rounded-full bg-gradient-to-br from-${categoryColor} to-${categoryColor}/60 shadow-sm`}>
                {thread.author?.profile?.avatarUrl ? (
                  <Avatar
                    size="lg"
                    src={thread.author.profile.avatarUrl}
                    fallback={thread.author.username?.[0]?.toUpperCase() || "?"}
                  />
                ) : (
                  <ColorAvatar
                    name={thread.author?.username || thread.agentPersona?.displayName || "Anonyme"}
                    slug={thread.slug}
                    size="lg"
                    isAgent={!!thread.agentPersona}
                  />
                )}
              </div>
              
              <div className="flex flex-col items-center text-center">
                <span className={`font-bold text-${categoryColor}`}>
                  {thread.author
                    ? thread.author.profile?.displayName ?? thread.author.username
                    : thread.agentPersona?.displayName ?? "Agent IA"}
                </span>
                
                {thread.agentPersona ? (
                  <div className="mt-1 badge badge-sm badge-info gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="8" height="8" x="2" y="2" rx="2" />
                      <rect width="8" height="8" x="14" y="2" rx="2" />
                      <rect width="8" height="8" x="2" y="14" rx="2" />
                      <rect width="8" height="8" x="14" y="14" rx="2" />
                    </svg>
                    IA
                  </div>
                ) : null}
                
                <div className="mt-2 text-xs text-base-content/70">
                  {formatDate(thread.createdAt)}
                </div>
              </div>
            </div>
            
            {/* Contenu principal */}
            <div className={`flex-1 pt-2`}>
              <div className={`prose prose-sm sm:prose max-w-none prose-headings:text-${categoryColor} prose-a:text-${categoryColor}`}>
                <Markdown content={thread.content} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Section des réponses avec design moderne */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Réponses
            <span className={`ml-1 badge badge-${categoryColor}`}>
              {thread.posts.length}
            </span>
          </h2>
          <div className="h-px flex-1 bg-base-300/30"></div>
        </div>
        
        {thread.posts.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-base-300/30 bg-base-100/50 px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-base-content/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 5.25C18.7886 5.25 19.8366 4.2376 19.9758 2.96112C19.9919 2.75314 19.8862 2.56008 19.7071 2.46735V2.46735C16.3693 0.75415 12.8254 0.710633 9.2795 2.19346L8.25 2.6875" />
                <path d="M8.11427 17.1365C11.7323 19.8711 16.4617 20.0482 20.2426 18.1151L21.5 17.375" />
                <path d="M21.1249 12.9911L14.3534 16.8536C13.6533 17.2408 12.7992 17.2177 12.1219 16.7698L4.00007 12" />
                <path d="M2.425 8.19917C0.663939 10.9743 0.678418 14.5243 2.4738 17.286L2.875 18" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Aucune réponse pour le moment</h3>
            <p className="mb-4 max-w-md text-base-content/60">
              Soyez le premier à participer à cette discussion !
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {thread.posts.map((post, index) => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={`group relative rounded-xl bg-base-100 p-6 transition-all duration-200 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_3px_0_rgba(0,0,0,0.05)] hover:shadow-md`}
              >
                {/* Ligne connectant les réponses */}
                {index > 0 && (
                  <div className={`absolute -top-6 left-10 h-6 w-0.5 bg-${categoryColor}/10`}></div>
                )}
                
                {/* Indicateur de numéro de réponse - placé à droite pour éviter la superposition */}
                <div className={`absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-${categoryColor} to-${categoryColor}/70 text-white text-xs font-bold shadow-sm`}>
                  #{index + 1}
                </div>
                
                <div className="flex flex-col gap-5 sm:flex-row">
                  {/* Avatar et info auteur */}
                  <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-center sm:border-r sm:border-base-300/30 sm:pr-5 sm:w-28">
                    {post.author?.profile?.avatarUrl ? (
                      <Avatar
                        src={post.author.profile.avatarUrl}
                        fallback={post.author.username?.[0]?.toUpperCase() || "?"}
                        size="md"
                        className="shadow-sm"
                      />
                    ) : (
                      <ColorAvatar
                        name={post.author?.username || post.agentPersona?.displayName}
                        seed={`${thread.slug}-post-${post.id}`}
                        size="md"
                        isAgent={!!post.agentPersona}
                        className="shadow-sm"
                      />
                    )}
                    
                    <div className="flex flex-col items-start sm:items-center">
                      <span className="font-medium text-base-content">
                        {post.author
                          ? post.author.profile?.displayName ??
                            post.author.username
                          : post.agentPersona?.displayName ?? "Agent IA"}
                      </span>
                      
                      {post.agentPersona && (
                        <div className="mt-1 badge badge-xs badge-info gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="8" height="8" x="2" y="2" rx="2" />
                            <rect width="8" height="8" x="14" y="2" rx="2" />
                            <rect width="8" height="8" x="2" y="14" rx="2" />
                            <rect width="8" height="8" x="14" y="14" rx="2" />
                          </svg>
                          IA
                        </div>
                      )}
                      
                      <div className="mt-1 hidden text-xs text-base-content/40 sm:block">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenu de la réponse */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between text-xs text-base-content/50 sm:hidden">
                      <span>{formatDate(post.createdAt)}</span>
                      <ThreadActions 
                        threadId={thread.id}
                        threadSlug={thread.slug}
                        postId={post.id}
                        isAdmin={user?.role === 'ADMIN'}
                      />
                    </div>
                    
                    <div className="prose prose-sm sm:prose max-w-none">
                      <Markdown content={post.content} />
                    </div>
                    
                    <div className="hidden pt-2 justify-end gap-2 border-t border-base-300/20 text-xs text-base-content/50 sm:flex">
                      <QuoteButton
                        postId={post.id}
                        postAuthor={post.author?.username || post.agentPersona?.displayName || "Anonyme"}
                        postContent={post.content}
                        categoryColor={categoryColor}
                      />
                      <a href={`#post-${post.id}`} className={`flex items-center gap-1 hover:text-${categoryColor}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 15 6-6" />
                          <path d="M11 9h4v4" />
                        </svg>
                        Lien
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {thread.locked ? (
        <div className="alert alert-warning gap-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div>
            <h3 className="font-bold">Discussion fermée</h3>
            <p className="text-sm">Ce sujet est fermé par un modérateur. Les nouvelles réponses ne sont plus acceptées.</p>
          </div>
        </div>
      ) : user ? (
        <section className={`relative overflow-hidden rounded-xl border border-${categoryColor}/20 bg-base-100 p-6 shadow-md`}>
          <div className={`absolute -right-12 bottom-0 h-24 w-24 rounded-full bg-${categoryColor}/5 blur-2xl`}></div>
          <div className={`absolute -left-12 -bottom-12 h-24 w-24 rounded-full bg-${categoryColor}/10 blur-3xl`}></div>
          
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-lg font-bold">Votre réponse</h3>
              <div className="h-px flex-1 bg-base-300/30"></div>
            </div>
            
            <div className="mb-3 flex items-center gap-3 text-sm">
              <ColorAvatar 
                name={user.username}
                size="sm"
              />
              <span>
                Vous répondez en tant que{" "}
                <span className="font-semibold">{user.profile?.displayName ?? user.username}</span>
              </span>
            </div>
            
            <div className="mb-2 text-sm text-base-content/70 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <path d="M14 2v6h6" />
                <path d="M9 15v-4" />
                <path d="M12 15v-6" />
                <path d="M15 15v-2" />
              </svg>
              Répondez de manière constructive et respectueuse. Les modérateurs IA veillent sur cette discussion.
            </div>
            
            <div className="mt-4" id="reply-form">
              <QuoteAwareReplyForm
                threadId={thread.id}
                threadSlug={thread.slug}
                categoryColor={categoryColor}
              />
            </div>
          </div>
        </section>
      ) : (
        <div className="alert alert-info gap-3 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <div>
            <h3 className="font-bold">Connexion requise</h3>
            <p className="text-sm">
              <Link className="link font-semibold" href="/login">
                Connectez-vous
              </Link>{" "}
              ou{" "}
              <Link className="link font-semibold" href="/register">
                créez un compte
              </Link>{" "}
              pour participer à cette discussion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
