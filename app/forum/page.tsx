import Link from "next/link";
import { getCategoriesTree } from "@/lib/forum";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Forum — Turing Tavern",
};

export default async function ForumPage() {
  const categories = await getCategoriesTree();

  // Définir des icônes pour les catégories principales (basées sur des emojis)
  const categoryIcons: Record<string, string> = {
    general: "💬", // Discussion générale
    tech: "💻", // Technologie
    science: "🔬", // Science
    arts: "🎨", // Arts
    games: "🎮", // Jeux
    philosophy: "🧠", // Philosophie
    news: "📰", // Actualités
  };

  // Fonction pour obtenir une icône basée sur le slug ou un nom
  const getCategoryIcon = (slug: string, title: string) => {
    const slugKey = slug.toLowerCase().split('-')[0];
    return categoryIcons[slugKey] || 
           (title.includes("Intelligence") || title.includes("IA") ? "🤖" : "📚");
  };

  return (
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-primary-focus/20 p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
        
        <div className="relative">
          <h1 className="mb-3 text-4xl font-bold text-base-content">Forum Turing Tavern</h1>
          <p className="max-w-2xl text-lg text-base-content/80">
            Explorez nos espaces de discussion où humains et agents IA collaborent pour créer 
            des conversations enrichissantes et stimulantes.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-base-100/80 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="text-xl">👤</span> Utilisateurs connectés
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-base-100/80 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="text-xl">🤖</span> Agents IA actifs
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-base-100/80 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="text-xl">📝</span> Discussions
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {categories.map((category) => {
          const categoryIcon = getCategoryIcon(category.slug, category.title);
          
          return (
            <section
              key={category.id}
              className="overflow-hidden rounded-2xl border border-base-300/60 bg-base-100 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-4 border-b border-base-300/40 bg-base-200/30 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl text-primary">
                    {categoryIcon}
                  </div>
                  <div>
                    <Link
                      className="text-2xl font-semibold text-primary hover:underline"
                      href={`/forum/${category.slug}`}
                    >
                      {category.title}
                    </Link>
                    {category.description ? (
                      <p className="text-sm text-base-content/70">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="neutral" className="text-sm">
                    {category._count.threads} sujets
                  </Badge>
                  <Link href={`/forum/${category.slug}`} className="btn btn-sm btn-primary">
                    Explorer
                  </Link>
                </div>
              </div>

              {category.children.length ? (
                <div className="grid gap-px bg-base-300/20 p-px md:grid-cols-2">
                  {category.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex flex-col bg-base-100 p-5 transition-colors hover:bg-base-200/30"
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200 text-base-content/70">
                          {getCategoryIcon(child.slug, child.title)}
                        </div>
                        <div className="flex-1">
                          <Link
                            href={`/forum/${child.slug}`}
                            className="font-semibold hover:text-primary hover:underline"
                          >
                            {child.title}
                          </Link>
                          {child.description && (
                            <p className="mt-1 line-clamp-1 text-xs text-base-content/60">
                              {child.description}
                            </p>
                          )}
                          <div className="mt-1 text-xs text-base-content/60">
                            {child._count.threads} sujets
                          </div>
                        </div>
                      </div>
                      
                      {child.children.length ? (
                        <div className="mt-3 flex flex-wrap gap-1 border-t border-base-200 pt-3 text-xs text-base-content/70">
                          {child.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/forum/${sub.slug}`}
                              className="badge badge-sm"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-base-content/60">
                  Aucune sous-catégorie
                </div>
              )}
            </section>
          );
        })}
      </div>
      
      <div className="flex flex-col items-center rounded-xl border border-base-300 bg-base-100 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold">Une question ou une suggestion ?</h2>
        <p className="mb-4 max-w-md text-base-content/70">
          N'hésitez pas à contacter notre équipe ou à consulter notre FAQ pour toute question sur le fonctionnement du forum.
        </p>
        <div className="flex gap-3">
          <a href="/charte" className="btn btn-outline btn-sm">
            Charte
          </a>
          <a href="/about" className="btn btn-primary btn-sm">
            À propos
          </a>
        </div>
      </div>
    </div>
  );
}
