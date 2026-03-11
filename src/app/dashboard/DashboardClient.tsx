'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────
type Color = 'RED' | 'BLUE' | 'GREEN' | 'PURPLE' | 'BLACK' | 'YELLOW' | 'MULTICOLOR'
type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'SUPER_RARE' | 'SECRET_RARE' | 'LEADER'

type Card = {
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
}

type BorrowItem = {
  id: string
  cardId: string
  quantity: number
  card: Card
}

type Borrow = {
  id: string
  borrowerName: string
  status: 'ACTIVE' | 'RETURNED'
  borrowedAt: string
  returnedAt: string | null
  items: BorrowItem[]
}

// ── Constants ──────────────────────────────────────────────────────────────
const COLORS: { key: Color; label: string; cls: string }[] = [
  { key: 'RED',        label: 'Червоний',  cls: '#ef4444' },
  { key: 'BLUE',       label: 'Синій',     cls: '#3b82f6' },
  { key: 'GREEN',      label: 'Зелений',   cls: '#22c55e' },
  { key: 'PURPLE',     label: 'Фіолетовий',cls: '#a855f7' },
  { key: 'BLACK',      label: 'Чорний',    cls: '#6b7280' },
  { key: 'YELLOW',     label: 'Жовтий',   cls: '#eab308' },
  { key: 'MULTICOLOR', label: 'Мульті',    cls: 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e)' },
]

const RARITIES: { key: Rarity; label: string; stars: number }[] = [
  { key: 'COMMON',      label: 'Common',      stars: 1 },
  { key: 'UNCOMMON',    label: 'Uncommon',    stars: 2 },
  { key: 'RARE',        label: 'Rare',        stars: 3 },
  { key: 'SUPER_RARE',  label: 'Super Rare',  stars: 4 },
  { key: 'SECRET_RARE', label: 'Secret Rare', stars: 5 },
  { key: 'LEADER',      label: 'Leader',      stars: 0 },
]

const COLOR_HEX: Record<Color, string> = {
  RED: '#ef4444', BLUE: '#3b82f6', GREEN: '#22c55e',
  PURPLE: '#a855f7', BLACK: '#6b7280', YELLOW: '#eab308', MULTICOLOR: '#fbbf24',
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const r = RARITIES.find(x => x.key === rarity)!
  const stars = r.stars > 0 ? '★'.repeat(r.stars) : '♛'
  return (
    <span className={`pill-badge rarity-${rarity}`} style={{ fontSize: 10 }}>
      {stars} {r.label}
    </span>
  )
}

function ColorDot({ color }: { color: Color }) {
  return <span className={`color-dot color-${color}`} title={color} />
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────
type ToastState = { message: string; type: 'success' | 'error'; id: number }

function Toast({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [toast.id, onDone])

  return (
    <div className="toast">
      {toast.type === 'success' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      )}
      <span style={{ color: toast.type === 'success' ? '#14532d' : '#7f1d1d' }}>{toast.message}</span>
    </div>
  )
}

// ── Card Tile ──────────────────────────────────────────────────────────────
function CardTile({
  card,
  onBorrow,
  onEdit,
  onDelete,
}: {
  card: Card
  onBorrow: (card: Card) => void
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
}) {
  const [imgErr, setImgErr] = useState(false)
  const available = card.availableQuantity
  const total = card.totalQuantity
  const borrowed = total - available
  const pct = total > 0 ? (available / total) * 100 : 100
  const colorHex = COLOR_HEX[card.color]

  return (
    <div className="card-tile card-hover">
      {/* Color accent bar */}
      <div className="card-accent" style={{ background: colorHex }} />

      {/* Image area */}
      <div className="card-img-wrap">
        {card.imageUrl && !imgErr ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="card-img"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="card-img-placeholder"
            style={{ background: `linear-gradient(160deg, ${colorHex}33 0%, #e8d4a4 100%)` }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(58,31,8,0.5)', letterSpacing: '0.05em' }}>
              {card.setCode}
            </span>
          </div>
        )}

      </div>

      {/* Info */}
      <div className="card-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <RarityBadge rarity={card.rarity} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <ColorDot color={card.color} />
          <span style={{ fontSize: 11, color: 'rgba(254,243,199,0.45)', fontFamily: 'var(--font-body)', letterSpacing: '0.06em' }}>
            {card.setCode}
          </span>
        </div>
        <h3 className="card-name">{card.name}</h3>

        {/* Availability bar */}
        <div className="avail-bar-wrap">
          <div className="avail-bar-track">
            <div
              className="avail-bar-fill"
              style={{
                width: `${pct}%`,
                background: pct < 30 ? '#ef4444' : pct < 60 ? '#eab308' : '#22c55e',
              }}
            />
          </div>
          <span className="avail-text">
            {available}/{total}
            {borrowed > 0 && <span style={{ color: '#991b1b', marginLeft: 4 }}>({borrowed} позичено)</span>}
          </span>
        </div>

        {card.notes && (
          <p className="card-notes">{card.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button
          className="btn-gold"
          disabled={available === 0}
          onClick={() => onBorrow(card)}
          style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
          title={available === 0 ? 'Недоступно' : 'Позичити'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
          </svg>
          Позичити
        </button>
        <button className="btn-ghost" onClick={() => onEdit(card)} style={{ padding: '7px 10px' }} title="Редагувати">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button className="btn-danger" onClick={() => onDelete(card)} style={{ padding: '7px 10px' }} title="Видалити">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Borrow Modal ───────────────────────────────────────────────────────────
function BorrowModal({
  card,
  onClose,
  onSuccess,
}: {
  card: Card
  onClose: () => void
  onSuccess: () => void
}) {
  const [borrowerName, setBorrowerName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowerName, items: [{ cardId: card.id, quantity }] }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Помилка')
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Позичити картку</h2>
            <p className="modal-sub">{card.name} · {card.setCode}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Card preview */}
          <div className="borrow-card-preview" style={{ borderLeftColor: COLOR_HEX[card.color] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ColorDot color={card.color} />
              <span style={{ fontFamily: 'var(--font-display)', color: '#b45309', fontSize: 15 }}>{card.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <RarityBadge rarity={card.rarity} />
              <span style={{ fontSize: 12, color: 'rgba(58,31,8,0.5)' }}>
                Доступно: <strong style={{ color: '#15803d' }}>{card.availableQuantity}</strong>/{card.totalQuantity}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="field-group">
              <label className="field-label">Ім&apos;я позичальника</label>
              <input
                type="text"
                placeholder="Ім'я учасника екіпажу"
                value={borrowerName}
                onChange={e => setBorrowerName(e.target.value)}
                className="field-input"
                required
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Кількість</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >−</button>
                <span style={{ minWidth: 30, textAlign: 'center', fontSize: 20, fontFamily: 'var(--font-display)', color: '#b45309' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(card.availableQuantity, q + 1))}
                >+</button>
                <span style={{ fontSize: 12, color: 'rgba(58,31,8,0.4)', marginLeft: 4 }}>
                  з {card.availableQuantity}
                </span>
              </div>
            </div>

            {error && (
              <div className="form-error">{error}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>
                Скасувати
              </button>
              <button type="submit" className="btn-gold" disabled={loading || !borrowerName} style={{ flex: 2 }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: '#1c1107', borderColor: 'rgba(28,17,7,0.25)' }} />Обробка...</> : 'Підтвердити позику'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Add/Edit Card Modal ────────────────────────────────────────────────────
type CardFormData = {
  name: string
  setCode: string
  imageUrl: string
  rarity: Rarity
  color: Color
  totalQuantity: number
  notes: string
}

const DEFAULT_FORM: CardFormData = {
  name: '', setCode: '', imageUrl: '', rarity: 'COMMON', color: 'RED', totalQuantity: 1, notes: '',
}

function CardModal({
  card,
  onClose,
  onSuccess,
}: {
  card: Card | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<CardFormData>(
    card
      ? { name: card.name, setCode: card.setCode, imageUrl: card.imageUrl || '', rarity: card.rarity, color: card.color, totalQuantity: card.totalQuantity, notes: card.notes || '' }
      : DEFAULT_FORM
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof CardFormData, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = card ? `/api/cards/${card.id}` : '/api/cards'
      const method = card ? 'PUT' : 'POST'
      const body = { ...form, totalQuantity: Number(form.totalQuantity) }
      if (card) {
        // For edit, only update allowed fields
        const editBody = { name: body.name, imageUrl: body.imageUrl || null, rarity: body.rarity, color: body.color, notes: body.notes || null }
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editBody) })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Помилка')
      } else {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Помилка')
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">{card ? 'Редагувати картку' : 'Додати картку'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Назва картки *</label>
                <input type="text" placeholder="Monkey D. Luffy" value={form.name} onChange={e => set('name', e.target.value)} className="field-input" required />
              </div>
              <div className="field-group" style={{ flex: '0 0 130px' }}>
                <label className="field-label">Код картки *</label>
                <input type="text" placeholder="OP01-001" value={form.setCode} onChange={e => set('setCode', e.target.value)} className="field-input" required disabled={!!card} style={card ? { opacity: 0.5 } : {}} />
              </div>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Колір *</label>
                <select value={form.color} onChange={e => set('color', e.target.value as Color)} className="field-input">
                  {COLORS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Рідкість *</label>
                <select value={form.rarity} onChange={e => set('rarity', e.target.value as Rarity)} className="field-input">
                  {RARITIES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
              </div>
              {!card && (
                <div className="field-group" style={{ flex: '0 0 90px' }}>
                  <label className="field-label">К-сть *</label>
                  <input type="number" min={1} max={99} value={form.totalQuantity} onChange={e => set('totalQuantity', Number(e.target.value))} className="field-input" required />
                </div>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">URL зображення</label>
              <input type="url" placeholder="https://..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} className="field-input" />
            </div>

            <div className="field-group">
              <label className="field-label">Нотатки</label>
              <input type="text" placeholder="Додаткова інформація..." value={form.notes} onChange={e => set('notes', e.target.value)} className="field-input" />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Скасувати</button>
              <button type="submit" className="btn-gold" disabled={loading} style={{ flex: 2 }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: '#1c1107', borderColor: 'rgba(28,17,7,0.25)' }} />Збереження...</> : (card ? 'Зберегти зміни' : 'Додати картку')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Borrow History ─────────────────────────────────────────────────────────
function BorrowHistoryPanel({
  borrows,
  onReturn,
  loading,
}: {
  borrows: Borrow[]
  onReturn: (id: string) => void
  loading: boolean
}) {
  const active = borrows.filter(b => b.status === 'ACTIVE')
  const returned = borrows.filter(b => b.status === 'RETURNED')

  if (loading) return <Spinner />

  if (borrows.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'rgba(180,100,20,0.2)' }}>
          <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 12h.01" />
          <path d="M12 7V3M8 7V5M16 7V5" />
        </svg>
        <p>Немає жодної позики</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {active.length > 0 && (
        <section>
          <h3 className="section-title">
            <span className="status-dot" style={{ background: '#f59e0b' }} />
            Активні позики ({active.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.map(b => (
              <BorrowRow key={b.id} borrow={b} onReturn={onReturn} />
            ))}
          </div>
        </section>
      )}

      {returned.length > 0 && (
        <section>
          <h3 className="section-title">
            <span className="status-dot" style={{ background: '#22c55e' }} />
            Повернені ({returned.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {returned.map(b => (
              <BorrowRow key={b.id} borrow={b} onReturn={onReturn} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BorrowRow({ borrow, onReturn }: { borrow: Borrow; onReturn: (id: string) => void }) {
  const isActive = borrow.status === 'ACTIVE'
  return (
    <div className="borrow-row" style={{ borderLeftColor: isActive ? '#f59e0b' : '#22c55e' }}>
      <div className="borrow-row-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot" style={{ background: isActive ? '#f59e0b' : '#22c55e' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: '#3a1f08' }}>{borrow.borrowerName}</span>
          <span className={`pill-badge ${isActive ? 'rarity-UNCOMMON' : 'rarity-COMMON'}`} style={{ fontSize: 9 }}>
            {isActive ? 'АКТИВНА' : 'ПОВЕРНЕНА'}
          </span>
        </div>
        {isActive && (
          <button className="btn-ghost" onClick={() => onReturn(borrow.id)} style={{ fontSize: 11, padding: '5px 10px' }}>
            ✓ Повернути
          </button>
        )}
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {borrow.items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(58,31,8,0.6)' }}>
            <ColorDot color={item.card.color} />
            <span>{item.card.name}</span>
            <span style={{ color: 'rgba(58,31,8,0.35)' }}>({item.card.setCode})</span>
            <span style={{ marginLeft: 'auto', color: '#b45309', fontFamily: 'var(--font-display)' }}>×{item.quantity}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(58,31,8,0.3)', display: 'flex', gap: 12 }}>
        <span>Взято: {fmtDate(borrow.borrowedAt)}</span>
        {borrow.returnedAt && <span>Повернено: {fmtDate(borrow.returnedAt)}</span>}
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardClient() {
  const [tab, setTab] = useState<'cards' | 'borrows'>('cards')
  const [cards, setCards] = useState<Card[]>([])
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowsLoading, setBorrowsLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selColors, setSelColors] = useState<Color[]>([])
  const [selRarities, setSelRarities] = useState<Rarity[]>([])
  const [availOnly, setAvailOnly] = useState(false)

  // Modals
  const [borrowTarget, setBorrowTarget] = useState<Card | null>(null)
  const [editTarget, setEditTarget] = useState<Card | null | 'new'>('new' as const)
  const [showCardModal, setShowCardModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null)

  const [toast, setToast] = useState<ToastState | null>(null)

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  // Fetch
  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cards')
      if (res.ok) setCards(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBorrows = useCallback(async () => {
    setBorrowsLoading(true)
    try {
      const res = await fetch('/api/borrows')
      if (res.ok) setBorrows(await res.json())
    } finally {
      setBorrowsLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])
  useEffect(() => { if (tab === 'borrows') fetchBorrows() }, [tab, fetchBorrows])

  // Filtered cards
  const filtered = useMemo(() => {
    return cards.filter(card => {
      if (search && !card.name.toLowerCase().includes(search.toLowerCase()) && !card.setCode.toLowerCase().includes(search.toLowerCase())) return false
      if (selColors.length > 0 && !selColors.includes(card.color)) return false
      if (selRarities.length > 0 && !selRarities.includes(card.rarity)) return false
      if (availOnly && card.availableQuantity === 0) return false
      return true
    })
  }, [cards, search, selColors, selRarities, availOnly])

  // Stats
  const stats = useMemo(() => {
    const total = cards.reduce((s, c) => s + c.totalQuantity, 0)
    const avail = cards.reduce((s, c) => s + c.availableQuantity, 0)
    const borrowed = total - avail
    const activeBorrows = borrows.filter(b => b.status === 'ACTIVE').length
    return { total, avail, borrowed, activeBorrows, uniqueCards: cards.length }
  }, [cards, borrows])

  function toggleColor(c: Color) {
    setSelColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }
  function toggleRarity(r: Rarity) {
    setSelRarities(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }
  function clearFilters() {
    setSearch('')
    setSelColors([])
    setSelRarities([])
    setAvailOnly(false)
  }

  async function handleReturn(id: string) {
    try {
      const res = await fetch(`/api/borrows/${id}`, { method: 'PUT' })
      if (!res.ok) throw new Error()
      showToast('Картки повернені до архіву')
      fetchBorrows()
      fetchCards()
    } catch {
      showToast('Помилка при поверненні', 'error')
    }
  }

  async function handleDelete(card: Card) {
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast(`"${card.name}" видалено`)
      setDeleteTarget(null)
      fetchCards()
    } catch {
      showToast('Помилка при видаленні', 'error')
    }
  }

  const hasFilters = search || selColors.length || selRarities.length || availOnly

  return (
    <>
      {/* ── Header ── */}
      <header className="dash-header nav-blur">
        <div className="dash-header-inner">
          <div className="dash-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
              <circle cx="12" cy="5" r="2" /><path d="M12 7v14" /><path d="M5 11h5M14 11h5" /><path d="M7 20l5 2 5-2" />
            </svg>
            <div>
              <p className="dash-logo-label">Thousand Seas Archive</p>
              <h1 className="dash-logo-title">Crew Collection</h1>
            </div>
          </div>

          {/* Stats chips */}
          <div className="dash-stats">
            <div className="stat-chip">
              <span className="stat-chip-val">{stats.uniqueCards}</span>
              <span className="stat-chip-lbl">Унікальних</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip-val">{stats.total}</span>
              <span className="stat-chip-lbl">Всього</span>
            </div>
            <div className="stat-chip" style={{ borderColor: stats.borrowed > 0 ? 'rgba(180,100,20,0.35)' : undefined }}>
              <span className="stat-chip-val" style={{ color: stats.borrowed > 0 ? '#b45309' : undefined }}>{stats.borrowed}</span>
              <span className="stat-chip-lbl">Позичено</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn-gold" onClick={() => { setEditTarget(null); setShowCardModal(true) }} style={{ fontSize: 13 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Додати
            </button>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn-ghost" style={{ fontSize: 12 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Вийти
              </button>
            </form>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab${tab === 'cards' ? ' dash-tab--active' : ''}`} onClick={() => setTab('cards')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
            </svg>
            Колекція
            <span className="tab-badge">{cards.length}</span>
          </button>
          <button className={`dash-tab${tab === 'borrows' ? ' dash-tab--active' : ''}`} onClick={() => setTab('borrows')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
            </svg>
            Позики
            {stats.borrowed > 0 && <span className="tab-badge" style={{ background: '#b45309' }}>{stats.activeBorrows}</span>}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="dash-body">
        {tab === 'cards' && (
          <div className="dash-layout">
            {/* Sidebar */}
            <aside className="dash-sidebar">
              <div className="sidebar-section">
                <p className="sidebar-section-title">Пошук</p>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(180,100,20,0.4)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  onClick={() => setAvailOnly(v => !v)}
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

            {/* Card Grid */}
            <main className="dash-main">
              {/* Results header */}
              <div className="results-bar">
                <span style={{ fontSize: 13, color: 'rgba(58,31,8,0.5)' }}>
                  {loading ? 'Завантаження...' : `${filtered.length} ${filtered.length === 1 ? 'картка' : filtered.length < 5 ? 'картки' : 'карток'}`}
                  {hasFilters && cards.length > 0 && ` з ${cards.length}`}
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

              {loading ? (
                <Spinner />
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  {cards.length === 0 ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 56, height: 56, color: 'rgba(180,100,20,0.2)' }}>
                        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M12 3v18" />
                      </svg>
                      <p>Архів порожній</p>
                      <p style={{ fontSize: 13, color: 'rgba(58,31,8,0.3)' }}>Додайте першу картку до колекції</p>
                      <button className="btn-gold" onClick={() => { setEditTarget(null); setShowCardModal(true) }} style={{ marginTop: 12 }}>
                        + Додати картку
                      </button>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'rgba(180,100,20,0.2)' }}>
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M8 11h6M11 8v6" />
                      </svg>
                      <p>Нічого не знайдено</p>
                      <button className="btn-ghost" onClick={clearFilters} style={{ marginTop: 8, fontSize: 13 }}>Скинути фільтри</button>
                    </>
                  )}
                </div>
              ) : (
                <div className="card-grid">
                  {filtered.map(card => (
                    <CardTile
                      key={card.id}
                      card={card}
                      onBorrow={c => setBorrowTarget(c)}
                      onEdit={c => { setEditTarget(c); setShowCardModal(true) }}
                      onDelete={c => setDeleteTarget(c)}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {tab === 'borrows' && (
          <div className="borrows-panel">
            <BorrowHistoryPanel borrows={borrows} onReturn={handleReturn} loading={borrowsLoading} />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {borrowTarget && (
        <BorrowModal
          card={borrowTarget}
          onClose={() => setBorrowTarget(null)}
          onSuccess={() => {
            setBorrowTarget(null)
            showToast(`"${borrowTarget.name}" успішно позичена`)
            fetchCards()
          }}
        />
      )}

      {showCardModal && (
        <CardModal
          card={editTarget instanceof Object && editTarget !== null ? editTarget as Card : null}
          onClose={() => { setShowCardModal(false); setEditTarget(null) }}
          onSuccess={() => {
            setShowCardModal(false)
            setEditTarget(null)
            showToast(editTarget ? 'Картку оновлено' : 'Картку додано до архіву')
            fetchCards()
          }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-body" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" style={{ width: 24, height: 24 }}>
                  <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#3a1f08', marginBottom: 8 }}>Видалити картку?</h3>
              <p style={{ fontSize: 14, color: 'rgba(58,31,8,0.5)', marginBottom: 24 }}>
                «{deleteTarget.name}» буде видалено з архіву назавжди.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-ghost" onClick={() => setDeleteTarget(null)} style={{ flex: 1 }}>Скасувати</button>
                <button className="btn-danger" onClick={() => handleDelete(deleteTarget)} style={{ flex: 1, justifyContent: 'center' }}>Видалити</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast toast={toast} onDone={() => setToast(null)} />
      )}

      <style>{`
        /* Header */
        .dash-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(180,100,20,0.15);
        }
        .dash-header-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 24px;
          flex-wrap: wrap;
        }
        .dash-logo { display: flex; align-items: center; gap: 12px; }
        .dash-logo-label { font-size: 10px; color: rgba(30,15,3,0.5); letter-spacing: 0.15em; text-transform: uppercase; font-family: var(--font-body); margin: 0; }
        .dash-logo-title { font-family: var(--font-display); font-size: 20px; color: #3a1a06; margin: 0; line-height: 1.1; }
        .dash-stats { display: flex; gap: 6px; margin-left: auto; }
        .stat-chip {
          display: flex; flex-direction: column; align-items: center;
          padding: 6px 14px;
          background: rgba(248,232,192,0.6);
          border: 1px solid rgba(180,100,20,0.18);
          border-radius: 10px;
          min-width: 60px;
        }
        .stat-chip-val { font-family: var(--font-display); font-size: 18px; color: #3a1a06; line-height: 1; }
        .stat-chip-lbl { font-size: 10px; color: rgba(120,60,10,0.45); margin-top: 2px; white-space: nowrap; font-family: var(--font-body); }

        /* Tabs */
        .dash-tabs { display: flex; padding: 0 24px; border-top: 1px solid rgba(180,100,20,0.1); }
        .dash-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 16px;
          background: none; border: none;
          color: rgba(30,15,3,0.5);
          font-family: var(--font-body);
          font-size: 13px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          margin-bottom: -1px;
        }
        .dash-tab:hover { color: rgba(58,31,8,0.75); }
        .dash-tab--active { color: #6b2d0a; border-bottom-color: #6b2d0a; }
        .tab-badge {
          padding: 1px 7px;
          background: rgba(180,100,20,0.12);
          border-radius: 999px;
          font-size: 10px;
          color: #b45309;
          font-family: var(--font-body);
        }

        /* Body layout */
        .dash-body { flex: 1; }
        .dash-layout { display: flex; min-height: calc(100vh - 120px); }
        .dash-sidebar {
          width: 220px;
          flex-shrink: 0;
          padding: 20px 16px;
          border-right: 1px solid rgba(180,100,20,0.1);
          background: rgba(195,150,60,0.3);
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: sticky;
          top: 120px;
          height: calc(100vh - 120px);
          overflow-y: auto;
        }
        .dash-main { flex: 1; padding: 20px 24px; min-width: 0; }

        /* Sidebar */
        .sidebar-section { display: flex; flex-direction: column; gap: 8px; }
        .sidebar-section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.13em; text-transform: uppercase; color: rgba(120,60,10,0.5); margin: 0; font-family: var(--font-body); }

        .color-filter-btn, .rarity-filter-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px;
          background: rgba(248,232,192,0.6);
          border: 1px solid rgba(180,100,20,0.15);
          border-radius: 8px;
          color: rgba(58,31,8,0.6);
          font-family: var(--font-body);
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          text-align: left;
          width: 100%;
        }
        .color-filter-btn:hover, .rarity-filter-btn:hover {
          background: rgba(248,236,204,0.9);
          border-color: rgba(180,100,20,0.3);
          color: #3a1f08;
        }
        .color-filter-btn.active, .rarity-filter-btn.active {
          background: rgba(251,191,36,0.15);
          border-color: rgba(180,100,20,0.4);
          color: #7c3a0a;
        }

        .avail-toggle {
          display: flex; align-items: center; gap: 10px;
          background: none; border: none; cursor: pointer;
          color: rgba(58,31,8,0.55); font-family: var(--font-body); font-size: 12px;
          padding: 0; transition: color 0.15s;
        }
        .avail-toggle:hover, .avail-toggle.active { color: #3a1f08; }
        .toggle-track {
          width: 34px; height: 18px;
          background: rgba(180,100,20,0.1);
          border: 1px solid rgba(180,100,20,0.2);
          border-radius: 999px;
          position: relative;
          transition: background 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .avail-toggle.active .toggle-track {
          background: rgba(180,83,9,0.25);
          border-color: rgba(180,83,9,0.5);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px; left: 2px;
          width: 12px; height: 12px;
          background: rgba(58,31,8,0.3);
          border-radius: 50%;
          transition: transform 0.2s, background 0.2s;
        }
        .avail-toggle.active .toggle-thumb {
          transform: translateX(16px);
          background: #b45309;
        }

        /* Results bar */
        .results-bar {
          display: flex; align-items: center; gap: 10; flex-wrap: wrap;
          margin-bottom: 16px;
          min-height: 28px;
          justify-content: space-between;
        }
        .active-filter-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px;
          background: rgba(251,191,36,0.18);
          border: 1px solid rgba(180,100,20,0.25);
          border-radius: 999px;
          font-size: 11px;
          color: #7c3a0a;
          cursor: pointer;
          font-family: var(--font-body);
          transition: background 0.15s;
        }
        .active-filter-chip:hover { background: rgba(251,191,36,0.3); }

        /* Card grid */
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 14px;
        }
        .card-tile {
          background: rgba(248,232,192,0.92);
          border: 1px solid rgba(180,100,20,0.18);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 1px 6px rgba(120,60,10,0.08);
        }
        .card-tile:hover { border-color: rgba(180,100,20,0.35); box-shadow: 0 4px 20px rgba(120,60,10,0.15); }
        .card-accent { height: 3px; width: 100%; flex-shrink: 0; }
        .card-img-wrap {
          position: relative;
          aspect-ratio: 5/7;
          overflow: hidden;
          flex-shrink: 0;
        }
        .card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .card-img-placeholder {
          width: 100%; height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-info { padding: 10px 12px 8px; flex: 1; }
        .card-name {
          font-family: var(--font-display);
          font-size: 14px;
          color: #4a2008;
          margin: 0 0 8px;
          line-height: 1.25;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .avail-bar-wrap { display: flex; flex-direction: column; gap: 4; }
        .avail-bar-track { height: 3px; background: rgba(120,60,10,0.1); border-radius: 999px; overflow: hidden; }
        .avail-bar-fill { height: 100%; border-radius: 999px; transition: width 0.3s; }
        .avail-text { font-size: 11px; color: rgba(58,31,8,0.45); font-family: var(--font-body); }
        .card-notes { font-size: 11px; color: rgba(58,31,8,0.35); margin: 5px 0 0; font-style: italic; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .card-actions { display: flex; gap: 5px; padding: 0 10px 10px; }

        /* Borrow panel */
        .borrows-panel { padding: 24px; max-width: 780px; margin: 0 auto; }
        .section-title {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 16px; color: #4a2008;
          margin: 0 0 12px;
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .borrow-row {
          background: rgba(248,232,192,0.9);
          border: 1px solid rgba(180,100,20,0.15);
          border-left: 3px solid;
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 1px 4px rgba(120,60,10,0.06);
        }
        .borrow-row-top { display: flex; align-items: center; justify-content: space-between; gap: 10; flex-wrap: wrap; }

        /* Modal */
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12;
          padding: 20px 22px 0;
        }
        .modal-title { font-family: var(--font-display); font-size: 20px; color: #3a1a06; margin: 0; }
        .modal-sub { font-size: 13px; color: rgba(58,31,8,0.45); margin: 4px 0 0; font-family: var(--font-body); }
        .modal-close {
          background: rgba(180,100,20,0.06); border: 1px solid rgba(180,100,20,0.18);
          border-radius: 8px; padding: 6px; cursor: pointer;
          color: rgba(58,31,8,0.5); transition: color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .modal-close:hover { color: #3a1f08; background: rgba(180,100,20,0.1); }
        .modal-body { padding: 20px 22px 22px; }
        .modal-form { display: flex; flex-direction: column; gap: 14px; }
        .field-group { display: flex; flex-direction: column; gap: 5; flex: 1; }
        .form-row { display: flex; gap: 12; flex-wrap: wrap; }
        .form-row .field-group { min-width: 120px; }
        .form-error {
          padding: 9px 12px;
          background: rgba(185,28,28,0.08);
          border: 1px solid rgba(185,28,28,0.22);
          border-radius: 8px;
          color: #991b1b;
          font-size: 13px;
          font-family: var(--font-body);
        }
        .borrow-card-preview {
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(180,100,20,0.15);
          border-left: 3px solid;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }
        .qty-btn {
          width: 34px; height: 34px;
          background: rgba(255,255,255,0.7);
          border: 1px solid rgba(180,100,20,0.22);
          border-radius: 8px;
          color: #4a2008;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
          line-height: 1;
        }
        .qty-btn:hover { background: rgba(251,191,36,0.2); border-color: rgba(180,100,20,0.4); }

        /* Empty state */
        .empty-state {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px;
          padding: 80px 20px;
          text-align: center;
          color: rgba(58,31,8,0.35);
          font-family: var(--font-body);
          font-size: 15px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dash-layout { flex-direction: column; }
          .dash-sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: 1px solid rgba(180,100,20,0.1); flex-direction: row; flex-wrap: wrap; gap: 12px; overflow-y: visible; padding: 16px; }
          .sidebar-section { min-width: 140px; flex: 1; }
          .dash-stats { display: none; }
          .dash-header-inner { padding: 12px 16px; }
          .card-grid { grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 10px; }
          .dash-main { padding: 14px 16px; }
        }
        @media (max-width: 480px) {
          .dash-header-inner { gap: 10px; }
          .card-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  )
}
