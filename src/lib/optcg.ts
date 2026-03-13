const BASE = 'https://www.optcgapi.com/api'

export type OPTCGCard = {
  card_name: string
  card_set_id: string      // e.g. "OP01-001"
  set_id: string           // e.g. "OP-01"
  set_name: string
  rarity: string           // "Common", "Uncommon", "Rare", "Super Rare", "Secret Rare", "Leader"
  card_color: string       // "Red", "Blue", etc. Can be "Red/Green" for multicolor
  card_type: string        // "Leader", "Character", "Event", "Stage"
  card_cost: string
  card_power: string
  counter_amount: string
  attribute: string
  card_text: string
  card_image: string       // URL
  market_price: string
  inventory_price: string
}

export type OPTCGSet = {
  set_id: string           // e.g. "OP-01"
  set_name: string
}

export async function fetchAllSets(): Promise<OPTCGSet[]> {
  const res = await fetch(`${BASE}/allSets/`)
  if (!res.ok) throw new Error(`OPTCG API error: ${res.status}`)
  return res.json()
}

export async function fetchAllDecks(): Promise<OPTCGSet[]> {
  const res = await fetch(`${BASE}/allDecks/`)
  if (!res.ok) throw new Error(`OPTCG API error: ${res.status}`)
  return res.json()
}

export async function fetchSetCards(setId: string): Promise<OPTCGCard[]> {
  const res = await fetch(`${BASE}/sets/${setId}/`)
  if (!res.ok) throw new Error(`OPTCG API error: ${res.status}`)
  return res.json()
}

export async function fetchDeckCards(stId: string): Promise<OPTCGCard[]> {
  const res = await fetch(`${BASE}/decks/${stId}/`)
  if (!res.ok) throw new Error(`OPTCG API error: ${res.status}`)
  return res.json()
}

// Maps OPTCG API rarity strings to our Rarity enum
export function mapRarity(r: string): 'COMMON' | 'UNCOMMON' | 'RARE' | 'SUPER_RARE' | 'SECRET_RARE' | 'LEADER' {
  const low = r.toLowerCase().trim()
  if (low === 'leader') return 'LEADER'
  if (low === 'secret rare') return 'SECRET_RARE'
  if (low === 'super rare') return 'SUPER_RARE'
  if (low === 'rare') return 'RARE'
  if (low === 'uncommon') return 'UNCOMMON'
  return 'COMMON'
}

// Maps OPTCG API color strings to our Color enum
export function mapColor(c: string): 'RED' | 'BLUE' | 'GREEN' | 'PURPLE' | 'BLACK' | 'YELLOW' | 'MULTICOLOR' {
  const low = c.toLowerCase().trim()
  if (low.includes('/')) return 'MULTICOLOR'
  if (low === 'red') return 'RED'
  if (low === 'blue') return 'BLUE'
  if (low === 'green') return 'GREEN'
  if (low === 'purple') return 'PURPLE'
  if (low === 'black') return 'BLACK'
  if (low === 'yellow') return 'YELLOW'
  return 'MULTICOLOR'
}

// Extracts set code prefix from card_set_id (e.g. "OP01-001" → "OP01")
export function extractSetPrefix(cardSetId: string): string {
  return cardSetId.split('-')[0]
}
