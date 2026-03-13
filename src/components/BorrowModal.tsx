'use client'

import { useState } from 'react'
import { RarityBadge, ColorDot } from './helpers'
import { COLOR_HEX } from './constants'
import type { Card } from './types'

export function BorrowModal({
  card,
  onClose,
  onSuccess,
  displayName,
}: {
  card: Card
  onClose: () => void
  onSuccess: () => void
  displayName: string
}) {
  const [borrowerName, setBorrowerName] = useState(displayName)
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
        body: JSON.stringify({ items: [{ cardId: card.id, quantity }] }),
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
          <div className="borrow-card-preview" style={{ borderLeftColor: COLOR_HEX[card.color] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ColorDot color={card.color} />
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-gold)', fontSize: 15 }}>{card.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <RarityBadge rarity={card.rarity} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Доступно: <strong style={{ color: '#22c55e' }}>{card.availableQuantity}</strong>/{card.totalQuantity}
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
                <span style={{ minWidth: 30, textAlign: 'center', fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text-gold)' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(card.availableQuantity, q + 1))}
                >+</button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
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
                {loading ? <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} />Обробка...</> : 'Підтвердити позику'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
