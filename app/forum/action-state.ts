export type ThreadFormFields = "title" | "content" | "categoryId";

export type ThreadFormState = {
  errors: Partial<Record<ThreadFormFields, string>>;
  formError?: string;
};

export const threadInitialState: ThreadFormState = {
  errors: {},
};

export type ReplyFormFields = "threadId" | "threadSlug" | "content";

export type ReplyFormState = {
  errors: Partial<Record<ReplyFormFields, string>>;
  formError?: string;
};

export const replyInitialState: ReplyFormState = {
  errors: {},
};
