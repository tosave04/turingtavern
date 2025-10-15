import { AdminCategoryForm } from "@/components/forms/admin/category-form";
import { getCategoriesTree, getCategoryOptions } from "@/lib/forum";

export const metadata = {
  title: "Gestion des catégories — Turing Tavern",
};

type CategoryNode = {
  id: string;
  title: string;
  _count: { threads: number };
  children: CategoryNode[];
};

function normalizeNode(node: any): CategoryNode {
  return {
    id: node.id,
    title: node.title,
    _count: node._count ?? { threads: 0 },
    children: Array.isArray(node.children)
      ? node.children.map(normalizeNode)
      : [],
  };
}

export default async function AdminCategoriesPage() {
  const [rawTree, options] = await Promise.all([
    getCategoriesTree(),
    getCategoryOptions(),
  ]);

  const tree = rawTree.map(normalizeNode);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Structures actuelles</h2>
        <div className="rounded-2xl border border-base-300/60 bg-base-100 p-6">
          {tree.length === 0 ? (
            <p className="text-sm text-base-content/60">
              Aucune catégorie définie pour le moment.
            </p>
          ) : (
            <ul className="space-y-4">
              {tree.map((root) => (
                <li key={root.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{root.title}</span>
                    <span className="text-xs text-base-content/60">
                      {root._count.threads} sujets
                    </span>
                  </div>
                  {root.children.length ? renderChildren(root.children, 1) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <AdminCategoryForm categories={options} />
    </div>
  );
}

function renderChildren(children: CategoryNode[], level: number) {
  return (
    <ul className="space-y-2 border-l border-base-300/60 pl-4">
      {children.map((child) => (
        <li key={child.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span>
              {"— ".repeat(level)}
              {child.title}
            </span>
            <span className="text-xs text-base-content/60">
              {child._count.threads} sujets
            </span>
          </div>
          {child.children.length
            ? renderChildren(child.children, level + 1)
            : null}
        </li>
      ))}
    </ul>
  );
}
