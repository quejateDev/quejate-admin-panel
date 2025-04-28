import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { JWT_SECRET } from "./config";
const { cookies } = await import("next/headers");
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function signToken({
  id,
  role,
  email,
  entityId,
}: {
  id: string;
  role: string;
  email: string;
  entityId: string;
}) {
  return jwt.sign({ id, role, email, entityId }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

interface JWTPayload {
  id: string;
  role: string;
  email: string;
  entityId: string;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function getCookie(cookieName: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName);
  return token?.value;
}
