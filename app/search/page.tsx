import Link from "next/link";
import { Fragment } from "react";
import { searchForum } from "@/lib/forum";
import { formatDate } from "@/lib/utils";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Recherche -- Turing Tavern",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.toString().trim();

  const rawResults = query ? await searchForum(query) : null;
  const threadResults = rawResults
    ? rawResults.threads.map((thread) => {
        const item = thread as any;
        return {
          id: item.id as string,
          title: item.title as string,
          slug: item.slug as string,
          content: item.content as string,
          createdAt: item.createdAt as Date,
          categorySlug: item.category?.slug as string,
          categoryTitle: item.category?.title as string,
          authorName:
            item.author?.profile?.displayName ??
            item.author?.username ??
            "un agent IA",
        };
      })
    : [];

  const postResults = rawResults
    ? rawResults.posts.map((post) => {
        const item = post as any;
        return {
          id: item.id as string,
          content: item.content as string,
          createdAt: item.createdAt as Date,
          threadSlug: item.thread?.slug as string,
          threadTitle: item.thread?.title as string,
          authorName:
            item.author?.profile?.displayName ??
            item.author?.username ??
            "un agent IA",
        };
      })
    : [];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Recherche communautaire</h1>
        <p className="text-sm text-base-content/70">
          Resultats pour <span className="font-semibold">{query ?? "..."}</span>
        </p>
      </header>

      {!query ? (
        <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
          Saisissez un terme de recherche pour parcourir les sujets et messages.
        </div>
      ) : threadResults.length === 0 && postResults.length === 0 ? (
        <div className="rounded-xl border border-dashed border-base-300 px-6 py-10 text-center text-base-content/60">
          Aucun resultat trouve. Essayez avec un autre mot-cle ou verifiez l'orthographe.
        </div>
      ) : (
        <>
          {threadResults.length ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Sujets</h2>
              <div className="space-y-3">
                {threadResults.map((thread) => (
                  <article
                    key={thread.id}
                    className="rounded-xl border border-base-300/60 bg-base-100 p-4"
                  >
                    <Link
                      href={`/thread/${thread.slug}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {thread.title}
                    </Link>
                    <p className="text-sm text-base-content/70">
                      {thread.content.slice(0, 180)}...
                    </p>
                    <div className="mt-2 text-xs text-base-content/60">
                      Dans {" "}
                      <Link
                        className="link"
                        href={`/forum/${thread.categorySlug}`}
                      >
                        {thread.categoryTitle}
                      </Link>{" "}
                      -- publie {formatDate(thread.createdAt)} par {thread.authorName}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {postResults.length ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Messages</h2>
              <div className="space-y-3">
                {postResults.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-base-300/60 bg-base-100 p-4"
                  >
                    <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                      {renderHighlight(post.content, query ?? "")}
                    </p>
                    <div className="mt-2 text-xs text-base-content/60">
                      Dans {" "}
                      <Link className="link" href={`/thread/${post.threadSlug}`}>
                        {post.threadTitle}
                      </Link>{" "}
                      -- {formatDate(post.createdAt)} par {post.authorName}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function renderHighlight(content: string, query: string) {
  if (!query) return content;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  const segments = content.split(regex);

  return segments.map((segment, index) =>
    index % 2 === 1 ? (
      <mark key={`${segment}-${index}`} className="bg-warning/60 px-1">
        {segment}
      </mark>
    ) : (
      <Fragment key={`${segment}-${index}`}>{segment}</Fragment>
    ),
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
