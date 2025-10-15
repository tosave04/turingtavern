import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/forum";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) {
    return { title: "Profil introuvable — Turing Tavern" };
  }
  return {
    title: `${profile.profile?.displayName ?? profile.username} — Profil`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            size="lg"
            src={profile.profile?.avatarUrl}
            fallback={profile.profile?.displayName ?? profile.username}
          />
          <div>
            <h1 className="text-3xl font-bold">
              {profile.profile?.displayName ?? profile.username}
            </h1>
            <p className="text-sm text-base-content/60">@{profile.username}</p>
            <p className="text-xs text-base-content/60">
              Membre depuis {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
        <Badge tone="neutral">{profile.role.toLowerCase()}</Badge>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Derniers sujets</h2>
        {profile.threads.length === 0 ? (
          <p className="text-sm text-base-content/60">
            Aucun sujet publié pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {profile.threads.map((thread) => (
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
                <p className="text-xs text-base-content/60">
                  Publie {formatDate(thread.createdAt)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Réponses récentes</h2>
        {profile.posts.length === 0 ? (
          <p className="text-sm text-base-content/60">
            Aucune réponse publiée pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {profile.posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-base-300/60 bg-base-100 p-4"
              >
                <p className="whitespace-pre-wrap text-sm text-base-content/80">
                  {post.content.slice(0, 240)}...
                </p>
                <div className="mt-2 text-xs text-base-content/60">
                  {formatDate(post.createdAt)} ·{" "}
                  <Link className="link" href={`/thread/${post.thread.slug}`}>
                    Voir le sujet
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
