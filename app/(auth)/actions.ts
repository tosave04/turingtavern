"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  loginInputSchema,
  loginUser,
  registerInputSchema,
  registerUser,
  type LoginInput,
  type RegisterInput,
} from "@/lib/auth";

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

export async function registerAction(
  _state: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const rawValues = {
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    email: formData.get("email") ?? undefined,
    password: formData.get("password"),
  };

  const parsed = registerInputSchema.safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = Object.entries(parsed.error.flatten().fieldErrors).reduce<
      RegisterActionState["errors"]
    >((acc, [key, val]) => {
      acc[key as keyof RegisterInput] = val?.[0];
      return acc;
    }, {});
    return {
      success: false,
      errors: fieldErrors,
    };
  }

  try {
    const { totpSecret, otpauthUrl, user } = await registerUser(parsed.data);
    return {
      success: true,
      totpSecret,
      otpauthUrl,
      message: `Compte créé avec succès. Bienvenue ${
        user.profile?.displayName ?? user.username
      }!`,
      errors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = Object.entries(error.flatten().fieldErrors).reduce<
        RegisterActionState["errors"]
      >((acc, [key, val]) => {
        acc[key as keyof RegisterInput] = val?.[0];
        return acc;
      }, {});
      return {
        success: false,
        errors: fieldErrors,
        formError: "Vérifiez vos informations.",
      };
    }
    return {
      success: false,
      errors: {},
      formError:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l'inscription.",
    };
  }
}

export type LoginActionState = {
  errors: Partial<Record<keyof LoginInput, string>>;
  formError?: string;
};

export const loginInitialState: LoginActionState = {
  errors: {},
};

export async function loginAction(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const rawValues = {
    username: formData.get("username"),
    password: formData.get("password"),
    totpCode: formData.get("totpCode"),
    remember: formData.get("remember") === "on",
  };

  const parsed = loginInputSchema.safeParse(rawValues);

  if (!parsed.success) {
    const fieldErrors = Object.entries(parsed.error.flatten().fieldErrors).reduce<
      LoginActionState["errors"]
    >((acc, [key, val]) => {
      acc[key as keyof LoginInput] = val?.[0];
      return acc;
    }, {});
    return {
      errors: fieldErrors,
    };
  }

  try {
    await loginUser(parsed.data);
    redirect("/forum");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = Object.entries(error.flatten().fieldErrors).reduce<
        LoginActionState["errors"]
      >((acc, [key, val]) => {
        acc[key as keyof LoginInput] = val?.[0];
        return acc;
      }, {});
      return {
        errors: fieldErrors,
        formError: "Vérifiez vos informations.",
      };
    }
    return {
      errors: {},
      formError:
        error instanceof Error
          ? error.message
          : "Impossible de vous connecter. Réessayez.",
    };
  }

  return loginInitialState;
}
