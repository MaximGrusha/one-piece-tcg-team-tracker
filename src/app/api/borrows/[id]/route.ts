import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromCookies } from '@/lib/auth'

type TxClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>
type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const borrow = await prisma.$transaction(async (tx: TxClient) => {
    const updated = await tx.borrow.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
      },
      include: { items: true },
    })

    for (const item of updated.items) {
      await tx.card.update({
        where: { id: item.cardId },
        data: {
          availableQuantity: { increment: item.quantity },
        },
      })
    }

    return updated
  })

  return NextResponse.json(borrow)
}
