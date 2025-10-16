"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCategory } from "@/lib/forum";
import { requireAdmin } from "@/lib/auth";
import { type CategoryFormErrors, type CategoryFormState } from "./category-form-state";

const formSchema = z.object({
  title: z.string().min(3).max(80),
  description: z.string().max(280).optional(),
  parentId: z.string().cuid().optional().or(z.literal("")),
  icon: z.string().max(48).optional(),
});

export async function submitCategory(
  _state: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = formSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    parentId: formData.get("parentId"),
    icon: formData.get("icon"),
  });

  if (!parsed.success) {
    const errors = Object.entries(parsed.error.flatten().fieldErrors).reduce<
      CategoryFormState["errors"]
    >((acc, [key, value]) => {
      acc[key as keyof CategoryFormErrors] = value?.[0];
      return acc;
    }, {});
    return { success: false, errors };
  }

  try {
    await createCategory({
      ...parsed.data,
      parentId: parsed.data.parentId || undefined,
    });
    revalidatePath("/forum");
    revalidatePath("/admin/categories");
  } catch (error) {
    return {
      success: false,
      errors: {},
      message:
        error instanceof Error
          ? error.message
          : "Creation de la categorie impossible pour le moment.",
    };
  }

  return {
    success: true,
    errors: {},
    message: "Categorie creee avec succes.",
  };
}
