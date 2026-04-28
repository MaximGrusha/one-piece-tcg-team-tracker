'use client'

import { useState, useEffect } from 'react'
import type { WishlistItem, ToastState } from './types'

const PRIORITY_LABEL = ['Звичайна', 'Висока', 'Терміново']
const PRIORITY_COLOR = ['var(--text-muted)', '#60a5fa', '#f43f5e']

function WishlistModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', imageUrl: '', cardmarketUrl: '', notes: '', priority: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null, cardmarketUrl: form.cardmarketUrl || null, notes: form.notes || null }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Помилка')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Додати до вішліста</h2>
            <p className="modal-sub">Картка яку хочеш придбати</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="field-group">
              <label className="field-label">Назва картки *</label>
              <input type="text" placeholder="Monkey D. Luffy" value={form.name} onChange={e => set('name', e.target.value)} className="field-input" required />
            </div>

            <div className="field-group">
              <label className="field-label">Посилання Cardmarket</label>
              <input type="url" placeholder="https://www.cardmarket.com/en/OnePiece/Products/..." value={form.cardmarketUrl} onChange={e => set('cardmarketUrl', e.target.value)} className="field-input" />
            </div>

            <div className="field-group">
              <label className="field-label">URL зображення</label>
              <input type="url" placeholder="https://..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} className="field-input" />
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="field-label">Пріоритет</label>
                <select value={form.priority} onChange={e => set('priority', Number(e.target.value))} className="field-input">
                  <option value={0}>Звичайна</option>
                  <option value={1}>Висока</option>
                  <option value={2}>Терміново</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Нотатки</label>
                <input type="text" placeholder="Примітка..." value={form.notes} onChange={e => set('notes', e.target.value)} className="field-input" />
              </div>
            </div>

            {form.imageUrl && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img src={form.imageUrl} alt="preview" style={{ maxHeight: 140, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border)' }} onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Скасувати</button>
              <button type="submit" className="btn-gold" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Збереження...' : '+ Додати до вішліста'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function WishCard({ item, isAdmin, onDelete }: { item: WishlistItem; isAdmin: boolean; onDelete: (id: string) => void }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="wish-card">
      <div className="wish-img-wrap">
        {item.imageUrl && !imgErr ? (
          <img src={item.imageUrl} alt={item.name} className="wish-img" onError={() => setImgErr(true)} />
        ) : (
          <div className="wish-img-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 32, height: 32, opacity: 0.35 }}>
              <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" />
            </svg>
          </div>
        )}
        {item.priority > 0 && (
          <div className="wish-priority-badge" style={{ background: item.priority === 2 ? 'rgba(244,63,94,0.9)' : 'rgba(96,165,250,0.9)' }}>
            {item.priority === 2 ? '🔥 Терміново' : '⬆ Висока'}
          </div>
        )}
      </div>

      <div className="wish-info">
        <h3 className="wish-name">{item.name}</h3>
        {item.notes && <p className="wish-notes">{item.notes}</p>}
        {item.addedBy && <span className="wish-author">від {item.addedBy.displayName}</span>}
      </div>

      <div className="wish-actions">
        {item.cardmarketUrl ? (
          <a href={item.cardmarketUrl} target="_blank" rel="noopener noreferrer" className="btn-gold" style={{ fontSize: 12, padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            Cardmarket
          </a>
        ) : (
          <a href={`https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(item.name)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 12, padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            Знайти
          </a>
        )}
        {isAdmin && (
          <button className="btn-icon danger" onClick={() => onDelete(item.id)} title="Видалити з вішліста">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export function WishlistPanel({
  isAdmin,
  showToast,
}: {
  isAdmin: boolean
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/wishlist')
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/wishlist/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems(p => p.filter(i => i.id !== id))
      showToast('Видалено з вішліста')
    } catch {
      showToast('Помилка при видаленні', 'error')
    }
  }

  return (
    <div className="wish-panel">
      <div className="wish-header">
        <div>
          <h2 className="wish-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            Вішліст
          </h2>
          <p className="wish-subtitle">{items.length} {items.length === 1 ? 'картка' : items.length < 5 ? 'картки' : 'карток'} для придбання</p>
        </div>
        {isAdmin && (
          <button className="btn-gold" onClick={() => setShowModal(true)} style={{ fontSize: 13, padding: '9px 16px' }}>
            + Додати
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <span className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 52, height: 52, color: 'var(--text-muted)' }}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <p>Вішліст порожній</p>
          <p style={{ fontSize: 12 }}>{isAdmin ? 'Додайте картки, які хочете придбати' : 'Адмін ще нічого не додав'}</p>
          {isAdmin && (
            <button className="btn-gold" onClick={() => setShowModal(true)} style={{ marginTop: 12 }}>+ Додати картку</button>
          )}
        </div>
      ) : (
        <div className="wish-grid">
          {items.map(item => (
            <WishCard key={item.id} item={item} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <WishlistModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchItems(); showToast('Додано до вішліста!') }}
        />
      )}
    </div>
  )
}
