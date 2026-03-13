import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;
type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await context.params;

  // MEMBER can only return their own borrows
  if (session.user.role === "MEMBER") {
    const existing = await prisma.borrow.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const borrow = await prisma.$transaction(async (tx: TxClient) => {
    const updated = await tx.borrow.update({
      where: { id },
      data: {
        status: "RETURNED",
        returnedAt: new Date(),
      },
      include: { items: true },
    });

    for (const item of updated.items) {
      await tx.card.update({
        where: { id: item.cardId },
        data: {
          availableQuantity: { increment: item.quantity },
        },
      });
    }

    return updated;
  });

  await logActivity('BORROW_RETURNED', session.user.id, `${borrow.items.length} позицій повернено`)

  return NextResponse.json(borrow);
}
