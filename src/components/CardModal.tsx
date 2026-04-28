'use client'

import { useState, useEffect, useRef } from 'react'
import { COLORS, RARITIES } from './constants'
import type { Card, CardFormData, CardSet, Color, Rarity } from './types'

const DEFAULT_FORM: CardFormData = {
  name: '', setCode: '', imageUrl: '', rarity: 'COMMON',
  color: 'RED', totalQuantity: 1, notes: '', cardmarketUrl: '',
}

function SetPickerPopup({
  sets, onSelect, onClose, searchRef,
}: {
  sets: CardSet[]
  onSelect: (s: CardSet) => void
  onClose: () => void
  searchRef: React.RefObject<HTMLInputElement | null>
}) {
  const [q, setQ] = useState('')
  const filtered = sets.filter(s =>
    s.code.toLowerCase().includes(q.toLowerCase()) ||
    s.name.toLowerCase().includes(q.toLowerCase())
  )
  const grouped = filtered.reduce<Record<string, CardSet[]>>((acc, s) => {
    if (!acc[s.type]) acc[s.type] = []
    acc[s.type].push(s)
    return acc
  }, {})

  const TYPE_LABEL: Record<string, string> = {
    BOOSTER: 'Бустери', STARTER_DECK: 'Стартові деки', PROMO: 'Промо',
  }

  return (
    <div className="set-picker-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="set-picker-box">
        <div className="set-picker-header">
          <h3 className="set-picker-title">Вибрати випуск</h3>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="set-picker-search">
          <input
            ref={searchRef as React.RefObject<HTMLInputElement>}
            type="text"
            placeholder="Пошук сету..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="field-input"
            autoFocus
          />
        </div>
        <div className="set-picker-list">
          {(['BOOSTER', 'STARTER_DECK', 'PROMO'] as const).map(type => {
            const group = grouped[type]
            if (!group?.length) return null
            return (
              <div key={type}>
                <p className="set-group-label">{TYPE_LABEL[type]}</p>
                {group.map(s => (
                  <button key={s.code} className="set-picker-item" onClick={() => onSelect(s)}>
                    <span className="set-picker-code">{s.code}</span>
                    <span className="set-picker-name">{s.name}</span>
                    {s.cardCount > 0 && <span className="set-filter-count">{s.cardCount}</span>}
                  </button>
                ))}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Нічого не знайдено
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export function CardModal({
  card, onClose, onSuccess,
}: {
  card: Card | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [sets, setSets] = useState<CardSet[]>([])
  const [showSetPicker, setShowSetPicker] = useState(false)
  const [selSet, setSelSet] = useState<CardSet | null>(null)
  const [cardNum, setCardNum] = useState('')
  const searchRef = useRef<HTMLInputElement | null>(null)

  const [form, setForm] = useState<CardFormData>(
    card
      ? {
          name: card.name, setCode: card.setCode, imageUrl: card.imageUrl || '',
          rarity: card.rarity, color: card.color, totalQuantity: card.totalQuantity,
          notes: card.notes || '', cardmarketUrl: card.cardmarketUrl || '',
        }
      : DEFAULT_FORM
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/sets').then(r => r.ok ? r.json() : []).then(setSets).catch(() => {})
  }, [])

  // when editing, parse existing setCode into set + number
  useEffect(() => {
    if (card && card.setCode && sets.length > 0) {
      const parts = card.setCode.split('-')
      if (parts.length >= 2) {
        const code = parts.slice(0, -1).join('-')
        const num = parts[parts.length - 1]
        const found = sets.find(s => s.code === code)
        if (found) { setSelSet(found); setCardNum(num) }
      }
    }
  }, [card, sets])

  // keep form.setCode in sync
  useEffect(() => {
    if (!card && selSet) {
      setForm(f => ({ ...f, setCode: cardNum ? `${selSet.code}-${cardNum}` : selSet.code }))
    }
  }, [selSet, cardNum, card])

  function set(field: keyof CardFormData, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const url = card ? `/api/cards/${card.id}` : '/api/cards'
      const method = card ? 'PUT' : 'POST'
      if (card) {
        const body: Record<string, unknown> = {
          name: form.name, imageUrl: form.imageUrl || null,
          rarity: form.rarity, color: form.color,
          notes: form.notes || null, cardmarketUrl: form.cardmarketUrl || null,
        }
        if (form.setCode && form.setCode !== card.setCode) body.setCode = form.setCode
        if (selSet) body.setId = selSet.id
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Помилка')
      } else {
        const body = { ...form, totalQuantity: Number(form.totalQuantity), setId: selSet?.id }
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

  const isEdit = !!card

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box" style={{ maxWidth: 520 }}>
          <div className="modal-header">
            <h2 className="modal-title">{isEdit ? 'Редагувати картку' : 'Додати картку'}</h2>
            <button className="modal-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit} className="modal-form">

              {/* Set picker (create only) */}
              {!isEdit && (
                <div className="field-group">
                  <label className="field-label">Випуск *</label>
                  <div className="set-select-row">
                    <button
                      type="button"
                      className="set-select-btn"
                      onClick={() => setShowSetPicker(true)}
                    >
                      {selSet ? (
                        <>
                          <span className="set-select-code">{selSet.code}</span>
                          <span className="set-select-name">{selSet.name}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Вибрати випуск...</span>
                      )}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginLeft: 'auto', flexShrink: 0 }}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {selSet && (
                      <input
                        type="text"
                        placeholder="001"
                        value={cardNum}
                        onChange={e => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="field-input set-num-input"
                        maxLength={4}
                      />
                    )}
                  </div>
                  {selSet && cardNum && (
                    <p className="set-preview-code">
                      Код картки: <strong>{selSet.code}-{cardNum}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Set picker — both create and edit */}
              {isEdit && (
                <div className="field-group">
                  <label className="field-label">Випуск</label>
                  <div className="set-select-row">
                    <button
                      type="button"
                      className="set-select-btn"
                      onClick={() => setShowSetPicker(true)}
                    >
                      {selSet ? (
                        <>
                          <span className="set-select-code">{selSet.code}</span>
                          <span className="set-select-name">{selSet.name}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{form.setCode || 'Вибрати випуск...'}</span>
                      )}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginLeft: 'auto', flexShrink: 0 }}>
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      placeholder="001"
                      value={cardNum}
                      onChange={e => {
                        const num = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setCardNum(num)
                        if (selSet) setForm(f => ({ ...f, setCode: `${selSet.code}-${num}` }))
                      }}
                      className="field-input set-num-input"
                      maxLength={4}
                    />
                  </div>
                  {(selSet || cardNum) && (
                    <p className="set-preview-code">
                      Новий код: <strong>{selSet ? `${selSet.code}-${cardNum}` : form.setCode}</strong>
                    </p>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="field-group">
                  <label className="field-label">Назва картки *</label>
                  <input type="text" placeholder="Monkey D. Luffy" value={form.name} onChange={e => set('name', e.target.value)} className="field-input" required />
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
                {!isEdit && (
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
                <input type="url" placeholder="https://www.cardmarket.com/..." value={form.cardmarketUrl} onChange={e => set('cardmarketUrl', e.target.value)} className="field-input" />
              </div>

              <div className="field-group">
                <label className="field-label">Нотатки</label>
                <input type="text" placeholder="Додаткова інформація..." value={form.notes} onChange={e => set('notes', e.target.value)} className="field-input" />
              </div>

              {error && <div className="form-error">{error}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Скасувати</button>
                <button type="submit" className="btn-gold" disabled={loading || (!isEdit && (!selSet || !cardNum || !form.name))} style={{ flex: 2 }}>
                  {loading
                    ? <><span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} />Збереження...</>
                    : isEdit ? 'Зберегти зміни' : 'Додати картку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showSetPicker && (
        <SetPickerPopup
          sets={sets}
          searchRef={searchRef}
          onSelect={s => { setSelSet(s); setShowSetPicker(false) }}
          onClose={() => setShowSetPicker(false)}
        />
      )}
    </>
  )
}
