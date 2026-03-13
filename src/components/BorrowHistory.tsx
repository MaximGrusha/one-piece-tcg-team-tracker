'use client'

import { ColorDot, Spinner, fmtDate } from './helpers'
import type { Borrow } from './types'

function BorrowRow({ borrow, onReturn }: { borrow: Borrow; onReturn: (id: string) => void }) {
  const isActive = borrow.status === 'ACTIVE'
  return (
    <div className="borrow-row" style={{ borderLeftColor: isActive ? '#f59e0b' : '#22c55e' }}>
      <div className="borrow-row-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot" style={{ background: isActive ? '#f59e0b' : '#22c55e' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-primary)' }}>{borrow.borrowerName}</span>
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
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <ColorDot color={item.card.color} />
            <span>{item.card.name}</span>
            <span style={{ color: 'var(--text-muted)' }}>({item.card.setCode})</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-gold)', fontFamily: 'var(--font-display)' }}>×{item.quantity}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
        <span>Взято: {fmtDate(borrow.borrowedAt)}</span>
        {borrow.returnedAt && <span>Повернено: {fmtDate(borrow.returnedAt)}</span>}
      </div>
    </div>
  )
}

export function BorrowHistoryPanel({
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'var(--text-muted)' }}>
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
