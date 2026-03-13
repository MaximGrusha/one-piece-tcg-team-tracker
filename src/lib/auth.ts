import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

export type AuthenticatedUser = {
  id: string;
  role: "ADMIN" | "MEMBER";
  displayName: string;
  email?: string | null;
};

type AuthOk = { session: Session & { user: AuthenticatedUser }; error: null };
type AuthErr = { session: null; error: NextResponse };

/**
 * Require any authenticated user.
 * Returns { session, error: null } on success, or { session: null, error: Response } on failure.
 */
export async function requireAuth(): Promise<AuthOk | AuthErr> {
  const session = (await auth()) as (Session & { user: AuthenticatedUser }) | null;
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/**
 * Require ADMIN role.
 * Returns { session, error: null } on success, or { session: null, error: Response } on failure.
 */
export async function requireAdmin(): Promise<AuthOk | AuthErr> {
  const result = await requireAuth();
  if (result.error) return result;
  if (result.session.user.role !== "ADMIN") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return result;
}
