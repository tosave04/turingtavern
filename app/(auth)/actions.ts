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
import { firstFieldErrors } from "@/lib/zod-errors";
import {
  loginInitialState,
  registerInitialState,
  type LoginActionState,
  type RegisterActionState,
} from "./auth-action-state";

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
    const fieldErrors = firstFieldErrors<RegisterInput>(parsed.error);
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
      message: `Compte cree avec succes. Bienvenue ${
        user.profile?.displayName ?? user.username
      }!`,
      errors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = firstFieldErrors<RegisterInput>(
        error as z.ZodError<RegisterInput>,
      );
      return {
        success: false,
        errors: fieldErrors,
        formError: "Verifiez vos informations.",
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
    const fieldErrors = firstFieldErrors<LoginInput>(parsed.error);
    return {
      errors: fieldErrors,
    };
  }

  try {
    await loginUser(parsed.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = firstFieldErrors<LoginInput>(
        error as z.ZodError<LoginInput>,
      );
      return {
        errors: fieldErrors,
        formError: "Verifiez vos informations.",
      };
    }
    return {
      errors: {},
      formError:
        error instanceof Error
          ? error.message
          : "Impossible de vous connecter. Reessayez.",
    };
  }

  redirect("/forum");
  return loginInitialState;
}
