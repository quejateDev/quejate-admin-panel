import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { JWT_SECRET } from "./config";
const { cookies } = await import("next/headers");
import { SignJWT, jwtVerify } from "jose";

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
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ id, role, email, entityId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

interface JWTPayload {
  id: string;
  role: string;
  email: string;
  entityId: string;
}

export function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return jwtVerify<JWTPayload>(token, secret).then(({ payload }) => {
      return payload;
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return Promise.resolve(null);
  }
}

export function getCookie(cookieName: string) {
  const cookieStore = cookies();

  let token: string | undefined;

  return cookieStore.then((cookieStore) => {
    token = cookieStore.get(cookieName)?.value;
    return token;
  });
}
