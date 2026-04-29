import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { fetchSetCards, fetchDeckCards, mapRarity, mapColor } from '@/lib/optcg'

// GET /api/cards/preview?setCode=OP01&q=luffy
// Fetches cards from OPTCG API for a given set, optionally filtered by name
export async function GET(req: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const setCode = searchParams.get('setCode')
  const q = (searchParams.get('q') ?? '').toLowerCase().trim()

  if (!setCode) {
    return NextResponse.json({ error: 'setCode is required' }, { status: 400 })
  }

  try {
    const apiSetId = setCode.replace(/([A-Z]+)(\d+)/, '$1-$2')
    const isStarter = setCode.startsWith('ST')

    const raw = isStarter
      ? await fetchDeckCards(apiSetId)
      : await fetchSetCards(apiSetId)

    const cards = raw
      .filter(c => !q || c.card_name.toLowerCase().includes(q))
      .map(c => ({
        setCode:   c.card_set_id,
        name:      c.card_name,
        imageUrl:  c.card_image || null,
        rarity:    mapRarity(c.rarity),
        color:     mapColor(c.card_color),
        cardType:  c.card_type || null,
        cost:      parseInt(c.card_cost) || null,
        power:     parseInt(c.card_power) || null,
        counter:   parseInt(c.counter_amount) || null,
        attribute: c.attribute || null,
        cardText:  c.card_text || null,
        setName:   c.set_name,
      }))

    return NextResponse.json(cards)
  } catch (err) {
    console.error('Preview fetch error:', err)
    return NextResponse.json({ error: 'Помилка запиту до OPTCG API' }, { status: 502 })
  }
}
