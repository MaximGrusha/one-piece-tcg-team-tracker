import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UpdateUserSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.displayName !== undefined)
    updateData.displayName = parsed.data.displayName;
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  // Prevent admin from removing their own admin role
  if (id === session.user.id && parsed.data.role === "MEMBER") {
    return NextResponse.json(
      { error: "Не можна змінити власну роль" },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });

  await logActivity('USER_UPDATED', session.user.id, `${user.displayName} (${Object.keys(parsed.data).join(', ')})`)

  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Не можна видалити власний акаунт" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { displayName: true, email: true } })
  await prisma.user.delete({ where: { id } });

  await logActivity('USER_DELETED', session.user.id, user ? `${user.displayName} (${user.email})` : id)

  return NextResponse.json({ success: true });
}
