import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { fetchSetCards, fetchDeckCards } from '@/lib/optcg'
import { logActivity } from '@/lib/activity'

// POST /api/prices — refresh prices for all cards (or a specific set)
export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const body = await req.json().catch(() => ({})) as { setCode?: string }
  const setCode = body.setCode // optional: refresh only one set

  try {
    const sets = setCode
      ? await prisma.cardSet.findMany({ where: { code: setCode } })
      : await prisma.cardSet.findMany()

    let updatedTotal = 0

    for (const cardSet of sets) {
      const apiSetId = cardSet.code.replace(/([A-Z]+)(\d+)/, '$1-$2')
      const isStarter = cardSet.code.startsWith('ST')

      let apiCards
      try {
        apiCards = isStarter
          ? await fetchDeckCards(apiSetId)
          : await fetchSetCards(apiSetId)
      } catch {
        continue // skip sets that fail to fetch
      }

      for (const c of apiCards) {
        const mktPrice = parseFloat(c.market_price)
        const invPrice = parseFloat(c.inventory_price)
        if (isNaN(mktPrice) && isNaN(invPrice)) continue

        const data: Record<string, unknown> = { priceUpdatedAt: new Date() }
        if (!isNaN(mktPrice)) data.marketPrice = mktPrice
        if (!isNaN(invPrice)) data.inventoryPrice = invPrice

        try {
          await prisma.card.update({
            where: { setCode: c.card_set_id },
            data,
          })
          updatedTotal++
        } catch {
          // card not in DB yet, skip
        }
      }
    }

    await logActivity('PRICES_REFRESHED', session.user.id, `${updatedTotal} карток, ${sets.length} сетів`)

    return NextResponse.json({ updated: updatedTotal, sets: sets.length })
  } catch (err) {
    console.error('Price refresh error:', err)
    return NextResponse.json({ error: 'Помилка оновлення цін' }, { status: 500 })
  }
}
