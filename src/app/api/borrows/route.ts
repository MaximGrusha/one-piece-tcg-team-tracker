import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { CreateBorrowSchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

type TxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const isAdmin = session.user.role === "ADMIN";

  const borrows = await prisma.borrow.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "RETURNED" } : {}),
      // MEMBER sees only their own borrows
      ...(!isAdmin ? { userId: session.user.id } : {}),
    },
    include: {
      items: {
        include: { card: true },
      },
    },
    orderBy: { borrowedAt: "desc" },
  });

  return NextResponse.json(borrows);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = CreateBorrowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items } = parsed.data;

  const borrow = await prisma.$transaction(async (tx: TxClient) => {
    const created = await tx.borrow.create({
      data: {
        borrowerName: session.user.displayName,
        userId: session.user.id,
        items: {
          create: items.map((item) => ({
            cardId: item.cardId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { card: true } },
      },
    });

    for (const item of items) {
      await tx.card.update({
        where: { id: item.cardId },
        data: {
          availableQuantity: { decrement: item.quantity },
        },
      });
    }

    return created;
  });

  const cardNames = borrow.items.map(i => i.card.name).join(', ')
  await logActivity('BORROW_CREATED', session.user.id, `${cardNames} (${items.length} позиції)`)

  return NextResponse.json(borrow, { status: 201 });
}
