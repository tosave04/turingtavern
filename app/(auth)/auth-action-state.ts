import type { LoginInput, RegisterInput } from "@/lib/auth";

export type RegisterActionState = {
  success: boolean;
  totpSecret?: string;
  otpauthUrl?: string;
  message?: string;
  errors: Partial<Record<keyof RegisterInput, string>>;
  formError?: string;
};

export const registerInitialState: RegisterActionState = {
  success: false,
  errors: {},
};

export type LoginActionState = {
  errors: Partial<Record<keyof LoginInput, string>>;
  formError?: string;
};

export const loginInitialState: LoginActionState = {
  errors: {},
};
