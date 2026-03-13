import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { fetchAllSets, fetchAllDecks } from '@/lib/optcg'

// GET /api/sets — list all sets in our DB
export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  const sets = await prisma.cardSet.findMany({
    orderBy: { code: 'asc' },
    include: { _count: { select: { cards: true } } },
  })

  return NextResponse.json(sets)
}

// POST /api/sets/  — sync sets from OPTCG API into our DB
export async function POST() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const [boosterSets, starterDecks] = await Promise.all([
      fetchAllSets(),
      fetchAllDecks(),
    ])

    let created = 0
    let skipped = 0

    for (const s of boosterSets) {
      const code = s.set_id.replace('-', '')  // "OP-01" → "OP01"
      const existing = await prisma.cardSet.findUnique({ where: { code } })
      if (existing) { skipped++; continue }
      await prisma.cardSet.create({
        data: { code, name: s.set_name, type: 'BOOSTER' },
      })
      created++
    }

    for (const s of starterDecks) {
      const code = s.set_id.replace('-', '')  // "ST-01" → "ST01"
      const existing = await prisma.cardSet.findUnique({ where: { code } })
      if (existing) { skipped++; continue }
      await prisma.cardSet.create({
        data: { code, name: s.set_name, type: 'STARTER_DECK' },
      })
      created++
    }

    return NextResponse.json({ created, skipped })
  } catch (err) {
    console.error('Set sync error:', err)
    return NextResponse.json(
      { error: 'Помилка синхронізації сетів з OPTCG API' },
      { status: 500 }
    )
  }
}
