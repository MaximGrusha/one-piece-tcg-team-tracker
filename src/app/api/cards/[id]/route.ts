import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { UpdateCardSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = UpdateCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const card = await prisma.card.update({
    where: { id },
    data: parsed.data,
  });

  await logActivity('CARD_UPDATED', session.user.id, `${card.name} (${card.setCode})`)

  return NextResponse.json(card);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const { id } = await context.params;

  const card = await prisma.card.findUnique({ where: { id }, select: { name: true, setCode: true } })
  await prisma.card.delete({ where: { id } });

  await logActivity('CARD_DELETED', session.user.id, card ? `${card.name} (${card.setCode})` : id)

  return NextResponse.json({ success: true });
}
