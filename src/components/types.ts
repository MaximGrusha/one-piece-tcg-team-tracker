export type Color = 'RED' | 'BLUE' | 'GREEN' | 'PURPLE' | 'BLACK' | 'YELLOW' | 'MULTICOLOR'
export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'SUPER_RARE' | 'SECRET_RARE' | 'LEADER'

export type Card = {
  id: string
  name: string
  setCode: string
  imageUrl: string | null
  rarity: Rarity
  color: Color
  totalQuantity: number
  availableQuantity: number
  notes: string | null
  createdAt: string
  cardType?: string | null
  cost?: number | null
  power?: number | null
  counter?: number | null
  attribute?: string | null
  cardText?: string | null
  setId?: string | null
  marketPrice?: number | null
  inventoryPrice?: number | null
  priceUpdatedAt?: string | null
  cardmarketUrl?: string | null
}

export type WishlistItem = {
  id: string
  name: string
  imageUrl: string | null
  cardmarketUrl: string | null
  notes: string | null
  priority: number
  createdAt: string
  addedBy?: { displayName: string } | null
}

export type BorrowItem = {
  id: string
  cardId: string
  quantity: number
  card: Card
}

export type Borrow = {
  id: string
  borrowerName: string
  status: 'ACTIVE' | 'RETURNED'
  borrowedAt: string
  returnedAt: string | null
  items: BorrowItem[]
}

export type CardSet = {
  id: string
  code: string
  name: string
  type: 'BOOSTER' | 'STARTER_DECK' | 'PROMO'
  releaseDate: string | null
  cardCount: number
  _count?: { cards: number }
}

export type ToastState = { message: string; type: 'success' | 'error'; id: number }

export type CardFormData = {
  name: string
  setCode: string
  imageUrl: string
  rarity: Rarity
  color: Color
  totalQuantity: number
  notes: string
  cardmarketUrl: string
}
