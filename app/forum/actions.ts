"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createPost, createThread } from "@/lib/forum";
import { requireUser } from "@/lib/auth";

const threadSchema = z.object({
  title: z.string().min(4).max(140),
  content: z.string().min(12),
  categoryId: z.string().cuid(),
});

export type ThreadFormState = {
  errors: Partial<Record<keyof z.infer<typeof threadSchema>, string>>;
  formError?: string;
};

export const threadInitialState: ThreadFormState = {
  errors: {},
};

export async function createThreadAction(
  _state: ThreadFormState,
  formData: FormData,
): Promise<ThreadFormState> {
  const user = await requireUser();

  const payload = {
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
  };

  const parsed = threadSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors = Object.entries(parsed.error.flatten().fieldErrors).reduce<
      ThreadFormState["errors"]
    >((acc, [key, val]) => {
      acc[key as keyof z.infer<typeof threadSchema>] = val?.[0];
      return acc;
    }, {});

    return { errors: fieldErrors };
  }

  try {
    const thread = await createThread({
      ...parsed.data,
      authorId: user.id,
    });

    revalidatePath("/");
    revalidatePath("/forum");
    revalidatePath(`/thread/${thread.slug}`);

    redirect(`/thread/${thread.slug}`);
  } catch (error) {
    return {
      errors: {},
      formError:
        error instanceof Error
          ? error.message
          : "Impossible de créer le sujet pour le moment.",
    };
  }

  return threadInitialState;
}

const replySchema = z.object({
  threadId: z.string().cuid(),
  threadSlug: z.string().min(1),
  content: z.string().min(3),
});

export type ReplyFormState = {
  errors: Partial<Record<keyof z.infer<typeof replySchema>, string>>;
  formError?: string;
};

export const replyInitialState: ReplyFormState = {
  errors: {},
};

export async function replyAction(
  _state: ReplyFormState,
  formData: FormData,
): Promise<ReplyFormState> {
  const user = await requireUser();
  const payload = {
    threadId: formData.get("threadId"),
    threadSlug: formData.get("threadSlug"),
    content: formData.get("content"),
  };

  const parsed = replySchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors = Object.entries(parsed.error.flatten().fieldErrors).reduce<
      ReplyFormState["errors"]
    >((acc, [key, val]) => {
      acc[key as keyof z.infer<typeof replySchema>] = val?.[0];
      return acc;
    }, {});

    return { errors: fieldErrors };
  }

  try {
    await createPost({
      threadId: parsed.data.threadId,
      content: parsed.data.content,
      authorId: user.id,
    });
    revalidatePath(`/thread/${parsed.data.threadSlug}`);
    redirect(`/thread/${parsed.data.threadSlug}`);
  } catch (error) {
    return {
      errors: {},
      formError:
        error instanceof Error
          ? error.message
          : "Impossible de publier la réponse.",
    };
  }

  return replyInitialState;
}
