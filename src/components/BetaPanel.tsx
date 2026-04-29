'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { CardSet } from './types'
import { COLOR_HEX } from './constants'

type PreviewCard = {
  setCode: string
  name: string
  imageUrl: string | null
  rarity: string
  color: string
  cardType: string | null
  cost: number | null
  power: number | null
  counter: number | null
  attribute: string | null
  cardText: string | null
  setName: string
}

const RARITY_SHORT: Record<string, string> = {
  COMMON: 'C', UNCOMMON: 'UC', RARE: 'R',
  SUPER_RARE: 'SR', SECRET_RARE: 'SEC', LEADER: 'L',
}

function QuickAddModal({
  card, sets, onClose, onSuccess,
}: {
  card: PreviewCard
  sets: CardSet[]
  onClose: () => void
  onSuccess: (name: string) => void
}) {
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const colorHex = COLOR_HEX[card.color as keyof typeof COLOR_HEX] ?? '#6b7280'

  const matchedSet = sets.find(s => card.setCode.startsWith(s.code + '-') || card.setCode === s.code)

  async function handleAdd() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: card.name,
          setCode: card.setCode,
          imageUrl: card.imageUrl || null,
          rarity: card.rarity,
          color: card.color,
          totalQuantity: qty,
          notes: null,
          cardmarketUrl: null,
          setId: matchedSet?.id ?? null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Помилка')
      }
      onSuccess(card.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Додати до колекції</h2>
            <p className="modal-sub" style={{ color: 'var(--text-gold)', fontSize: 12 }}>
              {card.setCode} · {card.setName}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="modal-body" style={{ paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 80, aspectRatio: '5/7', borderRadius: 8, overflow: 'hidden',
              border: `2px solid ${colorHex}55`, flexShrink: 0,
              background: `linear-gradient(160deg, ${colorHex}22, var(--bg-elevated))`,
            }}>
              {card.imageUrl
                ? <img src={card.imageUrl} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)' }}>{card.setCode}</div>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>{card.name}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px',
                  borderRadius: 99, border: '1px solid', fontFamily: 'var(--font-body)',
                }} className={`rarity-${card.rarity}`}>{RARITY_SHORT[card.rarity] ?? card.rarity}</span>
                <span style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 99,
                  background: colorHex + '22', color: colorHex,
                  border: `1px solid ${colorHex}44`, fontFamily: 'var(--font-body)',
                }}>{card.color}</span>
                {card.cardType && <span style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 0' }}>{card.cardType}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                {card.cost != null && <span>Cost: <strong style={{ color: 'var(--text-secondary)' }}>{card.cost}</strong></span>}
                {card.power != null && <span>Power: <strong style={{ color: 'var(--text-secondary)' }}>{card.power}</strong></span>}
                {card.counter != null && <span>Counter: <strong style={{ color: 'var(--text-secondary)' }}>{card.counter}</strong></span>}
              </div>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Кількість</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={{ flex: 1, textAlign: 'center', fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--text-gold)' }}>{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(99, q + 1))}>+</button>
            </div>
          </div>

          {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Скасувати</button>
            <button className="btn-gold" onClick={handleAdd} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'Додавання...' : `Додати ${qty} шт.`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewCardTile({ card, onAdd, alreadyInCollection }: {
  card: PreviewCard
  onAdd: (c: PreviewCard) => void
  alreadyInCollection: boolean
}) {
  const [imgErr, setImgErr] = useState(false)
  const colorHex = COLOR_HEX[card.color as keyof typeof COLOR_HEX] ?? '#6b7280'

  return (
    <div className="card-tile" style={{ '--card-color': colorHex + '55', borderColor: colorHex + '40', opacity: alreadyInCollection ? 0.65 : 1 } as React.CSSProperties}>
      <div className="card-accent" style={{ background: `linear-gradient(90deg, ${colorHex}, ${colorHex}88)` }} />

      <div className="card-img-wrap">
        {card.imageUrl && !imgErr ? (
          <img src={card.imageUrl} alt={card.name} className="card-img" onError={() => setImgErr(true)} />
        ) : (
          <div className="card-img-placeholder" style={{ background: `linear-gradient(160deg, ${colorHex}22 0%, var(--bg-elevated) 100%)` }}>
            {card.setCode}
          </div>
        )}
        <div className="card-rarity-badge">
          <span className={`pill-badge rarity-${card.rarity}`}>{RARITY_SHORT[card.rarity] ?? card.rarity}</span>
        </div>
        {alreadyInCollection && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 3,
            background: 'rgba(52,211,153,0.9)', color: '#fff',
            fontSize: 9, fontWeight: 700, padding: '2px 7px',
            borderRadius: 99, fontFamily: 'var(--font-body)',
          }}>✓ В колекції</div>
        )}
      </div>

      <div className="card-info">
        <div className="card-meta">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorHex, display: 'inline-block', flexShrink: 0 }} />
          <span className="card-set-code">{card.setCode}</span>
          {card.cardType && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>{card.cardType}</span>}
        </div>
        <h3 className="card-name">{card.name}</h3>
        {(card.cost != null || card.power != null) && (
          <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            {card.cost != null && <span>Cost <strong style={{ color: 'var(--text-secondary)' }}>{card.cost}</strong></span>}
            {card.power != null && <span>Power <strong style={{ color: 'var(--text-secondary)' }}>{card.power}</strong></span>}
          </div>
        )}
      </div>

      <div className="card-actions no-admin" style={{ gridTemplateColumns: '1fr' }}>
        <button
          className={alreadyInCollection ? 'btn-ghost' : 'btn-gold'}
          onClick={() => onAdd(card)}
          style={{ fontSize: 12, padding: '7px 10px' }}
        >
          {alreadyInCollection ? '+ Ще один' : '+ До колекції'}
        </button>
      </div>
    </div>
  )
}

export function BetaPanel({
  sets,
  existingCards,
  isAdmin,
  showToast,
  onCardAdded,
}: {
  sets: CardSet[]
  existingCards: { setCode: string }[]
  isAdmin: boolean
  showToast: (msg: string, type?: 'success' | 'error') => void
  onCardAdded: () => void
}) {
  const [selSet, setSelSet] = useState<CardSet | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PreviewCard[]>([])
  const [loading, setLoading] = useState(false)
  const [addTarget, setAddTarget] = useState<PreviewCard | null>(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const existingSetCodes = new Set(existingCards.map(c => c.setCode))

  const doSearch = useCallback(async (setCode: string, q: string) => {
    setLoading(true); setSearched(true)
    try {
      const params = new URLSearchParams({ setCode, q })
      const res = await fetch(`/api/cards/preview?${params}`)
      if (!res.ok) throw new Error()
      setResults(await res.json())
    } catch {
      setResults([]); showToast('Помилка завантаження даних з API', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (!selSet) { setResults([]); setSearched(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(selSet.code, query), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [selSet, query, doSearch])

  const grouped = sets.reduce<Record<string, CardSet[]>>((acc, s) => {
    if (!acc[s.type]) acc[s.type] = []
    acc[s.type].push(s)
    return acc
  }, {})
  const TYPE_LABEL: Record<string, string> = { BOOSTER: 'Бустери', STARTER_DECK: 'Стартові деки', PROMO: 'Промо' }

  return (
    <div className="beta-panel">
      {/* Header */}
      <div className="beta-header">
        <div>
          <h2 className="beta-title">
            <span className="beta-badge">β</span>
            Пошук карток
          </h2>
          <p className="beta-subtitle">Оберіть випуск → введіть назву → додайте до колекції одним кліком</p>
        </div>
      </div>

      {/* Controls */}
      <div className="beta-controls">
        {/* Set picker */}
        <div className="beta-set-select">
          <label className="field-label">Випуск</label>
          <select
            className="field-input"
            value={selSet?.code ?? ''}
            onChange={e => {
              const found = sets.find(s => s.code === e.target.value)
              setSelSet(found ?? null); setQuery(''); setResults([]); setSearched(false)
            }}
          >
            <option value="">Вибрати випуск...</option>
            {(['BOOSTER', 'STARTER_DECK', 'PROMO'] as const).map(type => {
              const group = grouped[type]
              if (!group?.length) return null
              return (
                <optgroup key={type} label={TYPE_LABEL[type]}>
                  {group.map(s => (
                    <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
                  ))}
                </optgroup>
              )
            })}
          </select>
        </div>

        {/* Name search */}
        <div className="beta-search-wrap">
          <label className="field-label">Назва картки</label>
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="field-input"
              style={{ paddingLeft: 38 }}
              placeholder={selSet ? `Пошук в ${selSet.code}...` : 'Спочатку оберіть випуск'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              disabled={!selSet}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="beta-results">
        {!selSet && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <p>Оберіть випуск для пошуку</p>
            <p style={{ fontSize: 12 }}>41 сет доступно — від OP01 до OP15 та стартові деки</p>
          </div>
        )}

        {selSet && loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" />
          </div>
        )}

        {selSet && !loading && searched && results.length === 0 && (
          <div className="empty-state">
            <p>Нічого не знайдено</p>
            <p style={{ fontSize: 12 }}>Спробуйте інший запит або оберіть інший випуск</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="results-count" style={{ marginBottom: 14 }}>
              {results.length} {results.length === 1 ? 'картка' : results.length < 5 ? 'картки' : 'карток'}
              {' '}· <span style={{ color: 'var(--text-gold)' }}>{selSet?.code} — {selSet?.name}</span>
            </p>
            <div className="card-grid">
              {results.map(c => (
                <PreviewCardTile
                  key={c.setCode}
                  card={c}
                  alreadyInCollection={existingSetCodes.has(c.setCode)}
                  onAdd={card => { if (isAdmin) setAddTarget(card) }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {addTarget && (
        <QuickAddModal
          card={addTarget}
          sets={sets}
          onClose={() => setAddTarget(null)}
          onSuccess={name => {
            setAddTarget(null)
            showToast(`"${name}" додано до колекції!`)
            onCardAdded()
          }}
        />
      )}
    </div>
  )
}
