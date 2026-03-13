'use client'

import { COLORS, RARITIES, COLOR_HEX } from './constants'
import type { Color, Rarity } from './types'

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
  filtered,
  totalCards,
  loading,
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
      <div className="sidebar-section">
        <p className="sidebar-section-title">Пошук</p>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Назва або код..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input"
            style={{ paddingLeft: 32, fontSize: 13 }}
          />
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">Колір</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {COLORS.map(c => (
            <button
              key={c.key}
              onClick={() => toggleColor(c.key)}
              className={`color-filter-btn${selColors.includes(c.key) ? ' active' : ''}`}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.cls, flexShrink: 0, display: 'inline-block' }} />
              {c.label}
              {selColors.includes(c.key) && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 12, height: 12, marginLeft: 'auto' }}>
                  <path d="M5 12l5 5 9-9" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">Рідкість</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {RARITIES.map(r => (
            <button
              key={r.key}
              onClick={() => toggleRarity(r.key)}
              className={`rarity-filter-btn rarity-${r.key}${selRarities.includes(r.key) ? ' active' : ''}`}
            >
              <span style={{ fontSize: 9 }}>{r.stars > 0 ? '★'.repeat(r.stars) : '♛'}</span>
              {r.label}
              {selRarities.includes(r.key) && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 12, height: 12, marginLeft: 'auto' }}>
                  <path d="M5 12l5 5 9-9" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

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
        <button onClick={clearFilters} className="btn-ghost" style={{ width: '100%', fontSize: 12 }}>
          ✕ Скинути фільтри
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
  return (
    <div className="results-bar">
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        {loading ? 'Завантаження...' : `${filtered} ${filtered === 1 ? 'картка' : filtered < 5 ? 'картки' : 'карток'}`}
        {hasFilters && totalCards > 0 && ` з ${totalCards}`}
      </span>
      {hasFilters && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {selColors.map(c => (
            <span key={c} className="active-filter-chip" onClick={() => toggleColor(c)}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLOR_HEX[c], display: 'inline-block' }} />
              {c} ✕
            </span>
          ))}
          {selRarities.map(r => (
            <span key={r} className="active-filter-chip" onClick={() => toggleRarity(r)}>
              {RARITIES.find(x => x.key === r)?.label} ✕
            </span>
          ))}
          {availOnly && <span className="active-filter-chip" onClick={() => setAvailOnly(false)}>Доступні ✕</span>}
        </div>
      )}
    </div>
  )
}
