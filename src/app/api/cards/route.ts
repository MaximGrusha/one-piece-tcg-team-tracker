import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromCookies } from '@/lib/auth'
import { Color, Rarity } from '../../../../generated/prisma/enums'

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const color = searchParams.get('color') as Color | null
  const rarity = searchParams.get('rarity') as Rarity | null
  const availableOnly = searchParams.get('available') === 'true'

  const cards = await prisma.card.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { setCode: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        color ? { color } : {},
        rarity ? { rarity } : {},
        availableOnly ? { availableQuantity: { gt: 0 } } : {},
      ],
    },
    orderBy: [{ setCode: 'asc' }],
  })

  return NextResponse.json(cards)
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, setCode, imageUrl, rarity, color, totalQuantity, notes } = body

  if (!name || !setCode || !rarity || !color || !totalQuantity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const card = await prisma.card.create({
    data: {
      name,
      setCode,
      imageUrl: imageUrl || null,
      rarity,
      color,
      totalQuantity: Number(totalQuantity),
      availableQuantity: Number(totalQuantity),
      notes: notes || null,
    },
  })

  return NextResponse.json(card, { status: 201 })
}
