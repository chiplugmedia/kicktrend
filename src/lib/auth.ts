import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "wanblog_super_secret_jwt_key_2026_change_in_production"
);

const SESSION_COOKIE_NAME = "wanblog_session";

export type UserRole = "user" | "author" | "manager" | "admin";

export interface SessionPayload {
  id: number;
  username: string;
  email: string;
  role: UserRole | string;
  avatar?: string | null;
}

export function canCreatePost(role: string): boolean {
  const r = role.toLowerCase();
  return r === "author" || r === "admin" || r === "manager";
}

export function canPublishDirectly(role: string): boolean {
  const r = role.toLowerCase();
  return r === "admin" || r === "manager";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export async function createSession(user: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required. Please log in with your username.");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await requireUser();
  if (user.role.toLowerCase() !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }
  return user;
}

export async function requireAuthor(): Promise<SessionPayload> {
  const user = await requireUser();
  const r = user.role.toLowerCase();
  if (r !== "author" && r !== "admin" && r !== "manager") {
    throw new Error("Forbidden: Author privileges required to write or manage articles.");
  }
  return user;
}

export async function requireAuthorOrAdmin(): Promise<SessionPayload> {
  return requireAuthor();
}
