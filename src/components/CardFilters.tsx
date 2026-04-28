'use client'

import { COLORS, RARITIES, COLOR_HEX } from './constants'
import type { Color, Rarity, CardSet } from './types'

const RARITY_SHORT: Record<Rarity, string> = {
  COMMON: 'C', UNCOMMON: 'UC', RARE: 'R', SUPER_RARE: 'SR', SECRET_RARE: 'SEC', LEADER: 'L',
}

const SET_TYPE_LABEL: Record<string, string> = {
  BOOSTER: 'Бустери', STARTER_DECK: 'Стартові деки', PROMO: 'Промо / The Best',
}

export function CardFilters({
  search, setSearch,
  selColors, toggleColor,
  selRarities, toggleRarity,
  availOnly, setAvailOnly,
  selSetCode, setSelSetCode,
  sets,
  hasFilters, clearFilters,
  open,
}: {
  search: string
  setSearch: (v: string) => void
  selColors: Color[]
  toggleColor: (c: Color) => void
  selRarities: Rarity[]
  toggleRarity: (r: Rarity) => void
  availOnly: boolean
  setAvailOnly: (v: boolean) => void
  selSetCode: string | null
  setSelSetCode: (v: string | null) => void
  sets: CardSet[]
  hasFilters: boolean
  clearFilters: () => void
  filtered: number
  totalCards: number
  loading: boolean
  open?: boolean
}) {
  const grouped = sets.reduce<Record<string, CardSet[]>>((acc, s) => {
    if (!acc[s.type]) acc[s.type] = []
    acc[s.type].push(s)
    return acc
  }, {})

  return (
    <aside className={`dash-sidebar${open ? ' open' : ''}`}>
      {/* Search */}
      <div className="sidebar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Назва або код..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="field-input"
        />
      </div>

      {/* Set filter */}
      <div className="sidebar-section">
        <p className="sidebar-label">Випуск</p>
        <div className="set-filter-list">
          <button
            className={`set-filter-btn${selSetCode === null ? ' active' : ''}`}
            onClick={() => setSelSetCode(null)}
          >
            <span className="set-filter-code">Всі</span>
            <span className="set-filter-name">Вся колекція</span>
          </button>
          {(['BOOSTER', 'STARTER_DECK', 'PROMO'] as const).map(type => {
            const group = grouped[type]
            if (!group?.length) return null
            return (
              <div key={type}>
                <p className="set-group-label">{SET_TYPE_LABEL[type]}</p>
                {group.map(s => (
                  <button
                    key={s.code}
                    className={`set-filter-btn${selSetCode === s.code ? ' active' : ''}`}
                    onClick={() => setSelSetCode(selSetCode === s.code ? null : s.code)}
                  >
                    <span className="set-filter-code">{s.code}</span>
                    <span className="set-filter-name">{s.name}</span>
                    {s._count && s._count.cards > 0 && (
                      <span className="set-filter-count">{s._count.cards}</span>
                    )}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Color filters */}
      <div className="sidebar-section">
        <p className="sidebar-label">Колір</p>
        <div className="color-grid">
          {COLORS.map(c => {
            const isActive = selColors.includes(c.key)
            return (
              <button
                key={c.key}
                onClick={() => toggleColor(c.key)}
                className={`color-btn${isActive ? ` active active-${c.key}` : ''}`}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                  background: c.key === 'MULTICOLOR'
                    ? 'conic-gradient(#ef4444 0deg, #3b82f6 90deg, #22c55e 180deg, #a855f7 270deg)'
                    : c.cls,
                }} />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rarity chips */}
      <div className="sidebar-section">
        <p className="sidebar-label">Рідкість</p>
        <div className="rarity-chips">
          {RARITIES.map(r => {
            const isActive = selRarities.includes(r.key)
            return (
              <button
                key={r.key}
                onClick={() => toggleRarity(r.key)}
                className={`rarity-chip rarity-${r.key}${isActive ? '' : ' inactive'}`}
              >
                {RARITY_SHORT[r.key]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Available toggle */}
      <div className="sidebar-section">
        <button onClick={() => setAvailOnly(!availOnly)} className={`avail-toggle${availOnly ? ' active' : ''}`}>
          <span className="toggle-track"><span className="toggle-thumb" /></span>
          Тільки доступні
        </button>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="clear-filters-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Скинути всі
        </button>
      )}
    </aside>
  )
}

export function ResultsBar({
  filtered, totalCards, loading, hasFilters,
  selColors, selRarities, availOnly, selSetCode,
  toggleColor, toggleRarity, setAvailOnly, setSelSetCode,
}: {
  filtered: number; totalCards: number; loading: boolean; hasFilters: boolean
  selColors: Color[]; selRarities: Rarity[]; availOnly: boolean; selSetCode: string | null
  toggleColor: (c: Color) => void; toggleRarity: (r: Rarity) => void
  setAvailOnly: (v: boolean) => void; setSelSetCode: (v: string | null) => void
}) {
  const countLabel = (n: number) => `${n} ${n === 1 ? 'картка' : n < 5 ? 'картки' : 'карток'}`

  return (
    <div className="results-bar">
      <span className="results-count">
        {loading ? 'Завантаження...' : countLabel(filtered)}
        {hasFilters && !loading && ` з ${totalCards}`}
      </span>
      {hasFilters && (
        <div className="active-chips">
          {selSetCode && (
            <span className="active-chip" onClick={() => setSelSetCode(null)}>
              {selSetCode}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 8, height: 8 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </span>
          )}
          {selColors.map(c => (
            <span key={c} className="active-chip" onClick={() => toggleColor(c)}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLOR_HEX[c], display: 'inline-block' }} />
              {c}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 8, height: 8 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </span>
          ))}
          {selRarities.map(r => (
            <span key={r} className="active-chip" onClick={() => toggleRarity(r)}>
              {RARITY_SHORT[r as Rarity]}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 8, height: 8 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </span>
          ))}
          {availOnly && (
            <span className="active-chip" onClick={() => setAvailOnly(false)}>
              Доступні
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 8, height: 8 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
