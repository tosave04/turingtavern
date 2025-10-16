import { authenticator } from "otplib";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, getSession } from "@/lib/session";
import type { Profile, User } from "@prisma/client";

const usernameSchema = z
  .string()
  .min(3, "Le pseudo doit contenir au moins 3 caractères.")
  .max(24, "Le pseudo doit contenir au maximum 24 caractères.")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Seuls lettres, chiffres, tirets et underscores sont autorisés.",
  );

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir 8 caractères minimum.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.")
  .regex(/[A-Z]/, "Ajoutez au moins une majuscule.");

export const registerInputSchema = z.object({
  username: usernameSchema,
  displayName: z
    .string()
    .min(3, "Le nom d'affichage est requis.")
    .max(32, "Le nom d'affichage est trop long."),
  password: passwordSchema,
  email: z
    .string()
    .email("Adresse email invalide.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const sanitizeOptionalInput = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const loginInputSchema = z
  .object({
    username: usernameSchema,
    password: z.preprocess(
      sanitizeOptionalInput,
      z.string().min(1, "Mot de passe requis.").optional(),
    ),
    totpCode: z.preprocess(
      sanitizeOptionalInput,
      z
        .string()
        .regex(/^\d{6}$/, "Le code TOTP doit comporter 6 chiffres.")
        .optional(),
    ),
    remember: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const hasPassword = typeof data.password === "string";
    const hasTotp = typeof data.totpCode === "string";

    if (!hasPassword && !hasTotp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Renseignez votre mot de passe ou votre code TOTP.",
        path: ["password"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Renseignez votre mot de passe ou votre code TOTP.",
        path: ["totpCode"],
      });
    } else if (hasPassword && hasTotp) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Utilisez soit le mot de passe, soit le code TOTP, mais pas les deux.",
        path: ["totpCode"],
      });
    }
  });

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;

export type CurrentUser = Pick<
  User,
  "id" | "username" | "role" | "createdAt" | "updatedAt"
> & {
  profile: Pick<Profile, "displayName" | "avatarUrl"> | null;
};

export async function registerUser(input: RegisterInput) {
  const data = registerInputSchema.parse(input);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.email ?? "" }],
    },
  });

  if (existingUser) {
    throw new Error("Un utilisateur avec ce pseudo ou cette adresse existe déjà.");
  }

  const passwordHash = await hashPassword(data.password);
  const totpSecret = authenticator.generateSecret();

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      totpSecret,
      profile: {
        create: {
          displayName: data.displayName,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  await createSession(user.id, true);

  return {
    user,
    totpSecret,
    otpauthUrl: authenticator.keyuri(
      data.username,
      "Turing Tavern",
      totpSecret,
    ),
  };
}

export async function loginUser(input: LoginInput) {
  const data = loginInputSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { username: data.username },
    include: { profile: true },
  });

  if (!user) {
    throw new Error("Utilisateur introuvable.");
  }

  if (data.password) {
    const isPasswordValid = await verifyPassword(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error("Mot de passe invalide.");
    }
  } else if (data.totpCode) {
    const isTotpValid = authenticator.check(data.totpCode, user.totpSecret);

    if (!isTotpValid) {
      throw new Error("Code TOTP invalide ou expiré.");
    }
  } else {
    throw new Error(
      "Renseignez votre mot de passe ou votre code TOTP pour vous connecter.",
    );
  }

  await createSession(user.id, data.remember ?? true);

  return user;
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    profile: user.profile
      ? {
          displayName: user.profile.displayName,
          avatarUrl: user.profile.avatarUrl,
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}
