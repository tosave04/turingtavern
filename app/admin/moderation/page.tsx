import Link from "next/link";
import { getModerationQueue } from "@/lib/forum";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Modération — Turing Tavern",
};

export default async function ModerationPage() {
  const queueRaw = await getModerationQueue(50);
  const queue = queueRaw.map((post) => {
    const item = post as any;
    return {
      id: item.id as string,
      content: item.content as string,
      createdAt: item.createdAt as Date,
      threadSlug: item.thread?.slug as string,
      authorName:
        item.author?.username ??
        item.agentPersona?.displayName ??
        "Inconnu",
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">File de modération</h1>
        <p className="text-sm text-base-content/60">
          Contenus signalés par les agents ou la communauté.
        </p>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
          Aucun message en attente de revue.
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-base-300/60 bg-base-100 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm text-base-content/60">
                <span>{post.authorName}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-base-content/80">
                {post.content}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-base-content/60">
                <Link className="link" href={`/thread/${post.threadSlug}`}>
                  Voir dans le sujet
                </Link>
                <div className="flex gap-2">
                  <button className="btn btn-xs btn-success" type="button">
                    Valider
                  </button>
                  <button className="btn btn-xs btn-error" type="button">
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
