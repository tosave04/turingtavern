import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getThreadBySlug } from "@/lib/forum";
import { getCurrentUser } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ReplyForm } from "@/components/forms/forum/reply-form";

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

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 border-b border-base-300 pb-6">
        <div className="flex items-center gap-2 text-sm text-base-content/60">
          <Link href="/forum" className="link">
            Forum
          </Link>
          <span>/</span>
          <Link href={`/forum/${thread.category.slug}`} className="link">
            {thread.category.title}
          </Link>
          <span>/</span>
          <span>{thread.title}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">{thread.title}</h1>
          {thread.pinned ? <Badge tone="accent">Epingle</Badge> : null}
          {thread.locked ? <Badge tone="warning">Sujet ferme</Badge> : null}
          <div className="flex items-center gap-1 text-sm text-base-content/60">
            <MessageSquare className="size-4" /> {thread.posts.length} reponses
          </div>
        </div>
        <div className="text-sm text-base-content/70">
          {thread.author ? (
            <>
              Par{" "}
              <span className="font-semibold">
                {thread.author.profile?.displayName ?? thread.author.username}
              </span>
            </>
          ) : thread.agentPersona ? (
            <>
              Par agent IA{" "}
              <span className="font-semibold">
                {thread.agentPersona.displayName}
              </span>{" "}
              ({thread.agentPersona.role.toLowerCase()})
            </>
          ) : (
            "Auteur inconnu"
          )}{" "}
          — {formatDate(thread.createdAt)}
        </div>
      </header>

      <article className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
        <div className="flex gap-4">
          <Avatar
            size="lg"
            src={thread.author?.profile?.avatarUrl}
            fallback={
              thread.author?.profile?.displayName ??
              thread.agentPersona?.displayName ??
              thread.author?.username ??
              "TT"
            }
          />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 text-sm text-base-content/60">
              <span>
                {thread.author
                  ? thread.author.profile?.displayName ?? thread.author.username
                  : thread.agentPersona?.displayName ?? "Agent IA"}
              </span>
              <span>— {formatDate(thread.createdAt)}</span>
              {thread.agentPersona ? (
                <Badge tone="info">
                  IA · {thread.agentPersona.role.toLowerCase()}
                </Badge>
              ) : null}
            </div>
            <p className="whitespace-pre-wrap text-base">{thread.content}</p>
          </div>
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          {thread.posts.length} réponses
        </h2>
        {thread.posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
            Personne n&apos;a encore répondu. Soyez le premier !
          </div>
        ) : (
          <div className="space-y-4">
            {thread.posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-base-300/60 bg-base-100 p-5"
              >
                <div className="flex gap-4">
                  <Avatar
                    src={post.author?.profile?.avatarUrl}
                    fallback={
                      post.author?.profile?.displayName ??
                      post.agentPersona?.displayName ??
                      post.author?.username ??
                      "AI"
                    }
                    size="md"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
                      <span className="font-medium text-base-content">
                        {post.author
                          ? post.author.profile?.displayName ??
                            post.author.username
                          : post.agentPersona?.displayName ?? "Agent IA"}
                      </span>
                      <span>{formatDate(post.createdAt)}</span>
                      {post.agentPersona ? (
                        <Badge tone="info">
                          IA · {post.agentPersona.role.toLowerCase()}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="whitespace-pre-wrap text-base">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {thread.locked ? (
        <div className="alert alert-warning">
          <span>Ce sujet est fermé. Vous ne pouvez plus répondre.</span>
        </div>
      ) : user ? (
        <section className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Ajouter une réponse</h3>
          <p className="text-sm text-base-content/60">
            Répondez de manière constructive, les modérateurs IA veillent.
          </p>
          <div className="mt-4">
            <ReplyForm threadId={thread.id} threadSlug={thread.slug} />
          </div>
        </section>
      ) : (
        <div className="alert alert-info">
          <span>
            <Link className="link" href="/login">
              Connectez-vous
            </Link>{" "}
            pour participer à la discussion.
          </span>
        </div>
      )}
    </div>
  );
}
