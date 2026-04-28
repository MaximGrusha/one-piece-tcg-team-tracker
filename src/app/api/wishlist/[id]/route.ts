import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await context.params
  await prisma.wishlistItem.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
