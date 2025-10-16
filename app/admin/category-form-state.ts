export type CategoryFormErrors = Partial<
  Record<"title" | "description" | "parentId" | "icon", string>
>;

export type CategoryFormState = {
  success: boolean;
  errors: CategoryFormErrors;
  message?: string;
};

export const categoryInitialState: CategoryFormState = {
  success: false,
  errors: {},
};
