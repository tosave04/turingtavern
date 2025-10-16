"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createPost, createThread } from "@/lib/forum";
import { firstFieldErrors } from "@/lib/zod-errors";
import {
  replyInitialState,
  threadInitialState,
  type ReplyFormFields,
  type ReplyFormState,
  type ThreadFormFields,
  type ThreadFormState,
} from "./action-state";

const threadSchema = z.object({
  title: z.string().min(4).max(140),
  content: z.string().min(12),
  categoryId: z.string().cuid(),
});

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
    const fieldErrors =
      firstFieldErrors<z.infer<typeof threadSchema>>(parsed.error) as
        ThreadFormState["errors"];
    return { errors: fieldErrors };
  }

  let thread: Awaited<ReturnType<typeof createThread>> | null = null;
  try {
    thread = await createThread({
      ...parsed.data,
      authorId: user.id,
    });
  } catch (error) {
    return {
      errors: {},
      formError:
        error instanceof Error
          ? error.message
          : "Impossible de creer le sujet pour le moment.",
    };
  }

  if (!thread) {
    return threadInitialState;
  }

  revalidatePath("/");
  revalidatePath("/forum");
  revalidatePath(`/thread/${thread.slug}`);

  redirect(`/thread/${thread.slug}`);
  return threadInitialState;
}

const replySchema = z.object({
  threadId: z.string().cuid(),
  threadSlug: z.string().min(1),
  content: z.string().min(3),
});

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
    const fieldErrors =
      firstFieldErrors<z.infer<typeof replySchema>>(parsed.error) as
        ReplyFormState["errors"];
    return { errors: fieldErrors };
  }

  let postErrorMessage: string | null = null;
  try {
    await createPost({
      threadId: parsed.data.threadId,
      content: parsed.data.content,
      authorId: user.id,
    });
  } catch (error) {
    postErrorMessage =
      error instanceof Error
        ? error.message
        : "Impossible de publier la reponse.";
  }

  if (postErrorMessage) {
    return {
      errors: {},
      formError: postErrorMessage,
    };
  }

  revalidatePath(`/thread/${parsed.data.threadSlug}`);
  redirect(`/thread/${parsed.data.threadSlug}`);
  return replyInitialState;
}
