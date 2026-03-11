import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromCookies } from '@/lib/auth'

type TxClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const borrows = await prisma.borrow.findMany({
    where: status ? { status: status as 'ACTIVE' | 'RETURNED' } : undefined,
    include: {
      items: {
        include: { card: true },
      },
    },
    orderBy: { borrowedAt: 'desc' },
  })

  return NextResponse.json(borrows)
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { borrowerName, items } = body

  if (!borrowerName || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const borrow = await prisma.$transaction(async (tx: TxClient) => {
    const created = await tx.borrow.create({
      data: {
        borrowerName,
        items: {
          create: (items as { cardId: string; quantity: number }[]).map(item => ({
            cardId: item.cardId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { card: true } },
      },
    })

    for (const item of items as { cardId: string; quantity: number }[]) {
      await tx.card.update({
        where: { id: item.cardId },
        data: {
          availableQuantity: { decrement: item.quantity },
        },
      })
    }

    return created
  })

  return NextResponse.json(borrow, { status: 201 })
}
