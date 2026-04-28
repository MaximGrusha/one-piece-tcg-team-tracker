'use client'

import { useState } from 'react'
import { COLORS, RARITIES, DEFAULT_CARD_FORM } from './constants'
import type { Card, CardFormData, Color, Rarity } from './types'

export function CardModal({
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
      ? { name: card.name, setCode: card.setCode, imageUrl: card.imageUrl || '', rarity: card.rarity, color: card.color, totalQuantity: card.totalQuantity, notes: card.notes || '', cardmarketUrl: card.cardmarketUrl || '' }
      : DEFAULT_CARD_FORM
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
        const editBody = { name: body.name, imageUrl: body.imageUrl || null, rarity: body.rarity, color: body.color, notes: body.notes || null, cardmarketUrl: body.cardmarketUrl || null }
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
              <label className="field-label">Посилання Cardmarket</label>
              <input type="url" placeholder="https://www.cardmarket.com/en/OnePiece/Products/..." value={form.cardmarketUrl} onChange={e => set('cardmarketUrl', e.target.value)} className="field-input" />
            </div>

            <div className="field-group">
              <label className="field-label">Нотатки</label>
              <input type="text" placeholder="Додаткова інформація..." value={form.notes} onChange={e => set('notes', e.target.value)} className="field-input" />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Скасувати</button>
              <button type="submit" className="btn-gold" disabled={loading} style={{ flex: 2 }}>
                {loading ? <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} />Збереження...</> : (card ? 'Зберегти зміни' : 'Додати картку')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
