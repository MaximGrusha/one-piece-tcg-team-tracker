import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SESSION_COOKIE = "team_session";

export type SessionPayload = {
  sub: "team";
};

export function signSession(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign({ sub: "team" } satisfies SessionPayload, secret, {
    expiresIn: "30d"
  });
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    return jwt.verify(token, secret) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

