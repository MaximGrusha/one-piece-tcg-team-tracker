import type { Color, Rarity } from './types'

export const COLORS: { key: Color; label: string; cls: string }[] = [
  { key: 'RED',        label: 'Червоний',  cls: '#ef4444' },
  { key: 'BLUE',       label: 'Синій',     cls: '#3b82f6' },
  { key: 'GREEN',      label: 'Зелений',   cls: '#22c55e' },
  { key: 'PURPLE',     label: 'Фіолетовий',cls: '#a855f7' },
  { key: 'BLACK',      label: 'Чорний',    cls: '#6b7280' },
  { key: 'YELLOW',     label: 'Жовтий',   cls: '#eab308' },
  { key: 'MULTICOLOR', label: 'Мульті',    cls: 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e)' },
]

export const RARITIES: { key: Rarity; label: string; stars: number }[] = [
  { key: 'COMMON',      label: 'Common',      stars: 1 },
  { key: 'UNCOMMON',    label: 'Uncommon',    stars: 2 },
  { key: 'RARE',        label: 'Rare',        stars: 3 },
  { key: 'SUPER_RARE',  label: 'Super Rare',  stars: 4 },
  { key: 'SECRET_RARE', label: 'Secret Rare', stars: 5 },
  { key: 'LEADER',      label: 'Leader',      stars: 0 },
]

export const COLOR_HEX: Record<Color, string> = {
  RED: '#ef4444', BLUE: '#3b82f6', GREEN: '#22c55e',
  PURPLE: '#a855f7', BLACK: '#6b7280', YELLOW: '#eab308', MULTICOLOR: '#fbbf24',
}

export const DEFAULT_CARD_FORM: import('./types').CardFormData = {
  name: '', setCode: '', imageUrl: '', rarity: 'COMMON', color: 'RED', totalQuantity: 1, notes: '',
}
