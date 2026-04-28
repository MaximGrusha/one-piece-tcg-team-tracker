import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { CreateWishlistSchema } from '@/lib/validations'

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const items = await prisma.wishlistItem.findMany({
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: { addedBy: { select: { displayName: true } } },
  })

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const body = await req.json().catch(() => null)
  const parsed = CreateWishlistSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const item = await prisma.wishlistItem.create({
    data: { ...parsed.data, addedById: session.user.id },
    include: { addedBy: { select: { displayName: true } } },
  })

  return NextResponse.json(item, { status: 201 })
}
