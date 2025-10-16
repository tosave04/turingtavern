import type { ZodError } from "zod";

export type FieldErrorMap<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;

export function firstFieldErrors<T extends Record<string, unknown>>(
  error: ZodError<T>,
): FieldErrorMap<T> {
  const flattened = error.flatten().fieldErrors as Partial<
    Record<keyof T, readonly (string | undefined)[] | undefined>
  >;
  const result: FieldErrorMap<T> = {};

  for (const key of Object.keys(flattened) as Array<keyof T>) {
    const messages = flattened[key];
    if (Array.isArray(messages) && messages.length > 0) {
      const message = messages.find((value) => Boolean(value));
      if (message) {
        result[key] = message;
      }
    }
  }

  return result;
}
