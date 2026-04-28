import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { fetchSetCards, fetchDeckCards, mapRarity, mapColor } from '@/lib/optcg'
import { z } from 'zod'
import { logActivity } from '@/lib/activity'

const ImportSchema = z.object({
  setCode: z.string().min(1),
  defaultQuantity: z.number().int().min(0).default(0),
})

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const body = await req.json().catch(() => null)
  const parsed = ImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Невірні дані', details: parsed.error.flatten() }, { status: 400 })
  }

  const { setCode, defaultQuantity } = parsed.data

  try {
    const cardSet = await prisma.cardSet.findUnique({ where: { code: setCode } })
    if (!cardSet) {
      return NextResponse.json({ error: `Сет "${setCode}" не знайдено в базі` }, { status: 404 })
    }

    const apiSetId = setCode.replace(/([A-Z]+)(\d+)/, '$1-$2')
    const isStarter = setCode.startsWith('ST')

    const apiCards = isStarter
      ? await fetchDeckCards(apiSetId)
      : await fetchSetCards(apiSetId)

    let imported = 0, skipped = 0, updated = 0

    for (const c of apiCards) {
      const cardSetId = c.card_set_id

      const existing = await prisma.card.findUnique({ where: { setCode: cardSetId } })

      if (existing) {
        const updates: Record<string, unknown> = {}
        if (!existing.imageUrl && c.card_image) updates.imageUrl = c.card_image
        if (!existing.cardType && c.card_type) updates.cardType = c.card_type
        if (!existing.cardText && c.card_text) updates.cardText = c.card_text
        if (!existing.setId) updates.setId = cardSet.id

        const cost = parseInt(c.card_cost)
        const power = parseInt(c.card_power)
        const counter = parseInt(c.counter_amount)
        if (existing.cost == null && !isNaN(cost)) updates.cost = cost
        if (existing.power == null && !isNaN(power)) updates.power = power
        if (existing.counter == null && !isNaN(counter)) updates.counter = counter
        if (!existing.attribute && c.attribute) updates.attribute = c.attribute

        if (Object.keys(updates).length > 0) {
          await prisma.card.update({ where: { setCode: cardSetId }, data: updates })
          updated++
        } else {
          skipped++
        }
        continue
      }

      const cost = parseInt(c.card_cost)
      const power = parseInt(c.card_power)
      const counter = parseInt(c.counter_amount)

      await prisma.card.create({
        data: {
          name: c.card_name,
          setCode: cardSetId,
          imageUrl: c.card_image || null,
          rarity: mapRarity(c.rarity),
          color: mapColor(c.card_color),
          totalQuantity: defaultQuantity,
          availableQuantity: defaultQuantity,
          cardType: c.card_type || null,
          cost: isNaN(cost) ? null : cost,
          power: isNaN(power) ? null : power,
          counter: isNaN(counter) ? null : counter,
          attribute: c.attribute || null,
          cardText: c.card_text || null,
          setId: cardSet.id,
        },
      })
      imported++
    }

    const totalCards = await prisma.card.count({ where: { setId: cardSet.id } })
    await prisma.cardSet.update({ where: { id: cardSet.id }, data: { cardCount: totalCards } })

    await logActivity('SET_IMPORTED', session.user.id, `${setCode}: +${imported} нових, ${updated} оновлено, ${skipped} без змін`)

    return NextResponse.json({ imported, skipped, updated, total: apiCards.length })
  } catch (err) {
    console.error('Import error:', err)
    return NextResponse.json({ error: 'Помилка імпорту карток з OPTCG API' }, { status: 500 })
  }
}
