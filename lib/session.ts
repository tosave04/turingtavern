"use server";

import { cookies } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { appConfig } from "@/lib/config";

const { cookieName, maxAgeMs } = appConfig.session;

type SessionWithUserId = {
  id: string;
  userId: string;
  expiresAt: Date;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function buildExpiryDate(remember = true) {
  const maxAge = remember ? maxAgeMs : 1000 * 60 * 60 * 6; // 6 hours
  return new Date(Date.now() + maxAge);
}

export async function createSession(userId: string, remember = true) {
  const token = randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = buildExpiryDate(remember);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      tokenHash: hashToken(token),
    },
  });

  cookieStore.delete(cookieName);
}

export async function getSession(): Promise<SessionWithUserId | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
  });

  if (!session) {
    cookieStore.delete(cookieName);
    return null;
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });
    cookieStore.delete(cookieName);
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeen: new Date() },
  });

  return session;
}
