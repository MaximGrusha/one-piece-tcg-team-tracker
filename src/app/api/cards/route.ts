import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { CreateCardSchema } from "@/lib/validations";
import { Color, Rarity } from "../../../../generated/prisma/enums";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const color = searchParams.get("color") as Color | null;
  const rarity = searchParams.get("rarity") as Rarity | null;
  const availableOnly = searchParams.get("available") === "true";

  const cards = await prisma.card.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { setCode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        color ? { color } : {},
        rarity ? { rarity } : {},
        availableOnly ? { availableQuantity: { gt: 0 } } : {},
      ],
    },
    orderBy: [{ setCode: "asc" }],
  });

  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = CreateCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, setCode, imageUrl, rarity, color, totalQuantity, notes } =
    parsed.data;

  const card = await prisma.card.create({
    data: {
      name,
      setCode,
      imageUrl: imageUrl ?? null,
      rarity,
      color,
      totalQuantity,
      availableQuantity: totalQuantity,
      notes: notes ?? null,
    },
  });

  await logActivity('CARD_CREATED', session.user.id, `${name} (${setCode})`)

  return NextResponse.json(card, { status: 201 });
}
