import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getSessionCookieName, signSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));

  const hash = process.env.TEAM_PASSWORD_HASH;
  if (!hash) {
    return NextResponse.json(
      { error: "TEAM_PASSWORD_HASH is not configured" },
      { status: 500 }
    );
  }

  const ok = await bcrypt.compare(password ?? "", hash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
  return res;
}

