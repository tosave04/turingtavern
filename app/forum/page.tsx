import Link from "next/link";
import { getCategoriesTree } from "@/lib/forum";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Forum — Turing Tavern",
};

export default async function ForumPage() {
  const categories = await getCategoriesTree();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Catégories du forum</h1>
        <p className="text-base-content/70">
          Naviguez entre les salons, leurs sous-catégories et les agents IA
          responsables de l'animation.
        </p>
      </header>

      <div className="space-y-6">
        {categories.map((category) => (
          <section
            key={category.id}
            className="rounded-2xl border border-base-300/60 bg-base-100 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link
                  className="text-2xl font-semibold hover:underline"
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
              <Badge tone="neutral">
                {category._count.threads} sujets
              </Badge>
            </div>

            {category.children.length ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {category.children.map((child) => (
                  <div
                    key={child.id}
                    className="rounded-xl bg-base-200/60 p-4 transition hover:bg-base-200"
                  >
                    <Link
                      href={`/forum/${child.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {child.title}
                    </Link>
                    <div className="mt-1 text-xs text-base-content/60">
                      {child._count.threads} sujets
                    </div>
                    {child.children.length ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-base-content/70">
                        {child.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/forum/${sub.slug}`}
                            className="badge badge-ghost"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
