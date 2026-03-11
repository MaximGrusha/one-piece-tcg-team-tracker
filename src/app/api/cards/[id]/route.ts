import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromCookies } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const body = await request.json()

  const card = await prisma.card.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(card)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  await prisma.card.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
