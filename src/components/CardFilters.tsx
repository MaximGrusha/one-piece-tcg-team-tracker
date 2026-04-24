'use client'

import { COLORS, RARITIES, COLOR_HEX } from './constants'
import type { Color, Rarity } from './types'

const RARITY_SHORT: Record<Rarity, string> = {
  COMMON: 'C', UNCOMMON: 'UC', RARE: 'R', SUPER_RARE: 'SR', SECRET_RARE: 'SEC', LEADER: 'L',
}

export function CardFilters({
  search,
  setSearch,
  selColors,
  toggleColor,
  selRarities,
  toggleRarity,
  availOnly,
  setAvailOnly,
  hasFilters,
  clearFilters,
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
  hasFilters: boolean
  clearFilters: () => void
  filtered: number
  totalCards: number
  loading: boolean
  open?: boolean
}) {
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
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: c.key === 'MULTICOLOR'
                      ? 'conic-gradient(#ef4444 0deg, #3b82f6 90deg, #22c55e 180deg, #a855f7 270deg)'
                      : c.cls,
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                />
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
        <button
          onClick={() => setAvailOnly(!availOnly)}
          className={`avail-toggle${availOnly ? ' active' : ''}`}
        >
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
          Тільки доступні
        </button>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="clear-filters-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          Скинути фільтри
        </button>
      )}
    </aside>
  )
}

export function ResultsBar({
  filtered,
  totalCards,
  loading,
  hasFilters,
  selColors,
  selRarities,
  availOnly,
  toggleColor,
  toggleRarity,
  setAvailOnly,
}: {
  filtered: number
  totalCards: number
  loading: boolean
  hasFilters: boolean
  selColors: Color[]
  selRarities: Rarity[]
  availOnly: boolean
  toggleColor: (c: Color) => void
  toggleRarity: (r: Rarity) => void
  setAvailOnly: (v: boolean) => void
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
