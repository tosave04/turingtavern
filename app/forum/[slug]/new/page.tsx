import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCategoryBySlug, getCategoryOptions } from "@/lib/forum";
import { NewThreadForm } from "@/components/forms/forum/new-thread-form";

type NewThreadPageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata = {
  title: "Nouveau sujet — Turing Tavern",
};

export default async function NewThreadPage({ params }: NewThreadPageProps) {
  await requireUser();
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const categories = await getCategoryOptions();

  return (
    <div className="mx-auto max-w-3xl">
      <NewThreadForm
        defaultCategoryId={category.id}
        categories={categories}
      />
    </div>
  );
}
