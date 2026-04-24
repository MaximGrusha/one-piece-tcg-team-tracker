'use client'

import { ColorDot, Spinner, fmtDate } from './helpers'
import type { Borrow } from './types'

function BorrowCard({ borrow, onReturn }: { borrow: Borrow; onReturn: (id: string) => void }) {
  const isActive = borrow.status === 'ACTIVE'
  return (
    <div className="borrow-card" style={{ borderLeftColor: isActive ? '#f59e0b' : '#22c55e' }}>
      <div className="borrow-card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="status-dot" style={{ background: isActive ? '#f59e0b' : '#22c55e' }} />
          <span className="borrow-name">{borrow.borrowerName}</span>
          <span
            className="pill-badge"
            style={{
              background: isActive ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
              color: isActive ? '#fbbf24' : '#4ade80',
              border: `1px solid ${isActive ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}`,
              fontSize: 9,
            }}
          >
            {isActive ? 'АКТИВНА' : 'ЗАКРИТА'}
          </span>
        </div>
        {isActive && (
          <button
            className="btn-ghost"
            onClick={() => onReturn(borrow.id)}
            style={{ fontSize: 11, padding: '5px 12px', gap: 5 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 11, height: 11 }}>
              <path d="M5 12l5 5 9-9" />
            </svg>
            Повернути
          </button>
        )}
      </div>

      <div className="borrow-items">
        {borrow.items.map(item => (
          <div key={item.id} className="borrow-item">
            <ColorDot color={item.card.color} />
            <span style={{ color: 'var(--text-secondary)' }}>{item.card.name}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({item.card.setCode})</span>
            <span className="borrow-item-qty">×{item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="borrow-dates">
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
  if (loading) return <Spinner />

  const active = borrows.filter(b => b.status === 'ACTIVE')
  const returned = borrows.filter(b => b.status === 'RETURNED')

  if (borrows.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 48, height: 48, color: 'var(--text-muted)' }}>
          <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
        </svg>
        <p>Немає жодної позики</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {active.length > 0 && (
        <section>
          <h3 className="section-title">
            <span className="status-dot" style={{ background: '#f59e0b' }} />
            Активні ({active.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map(b => <BorrowCard key={b.id} borrow={b} onReturn={onReturn} />)}
          </div>
        </section>
      )}
      {returned.length > 0 && (
        <section>
          <h3 className="section-title">
            <span className="status-dot" style={{ background: '#4ade80' }} />
            Повернені ({returned.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {returned.map(b => <BorrowCard key={b.id} borrow={b} onReturn={onReturn} />)}
          </div>
        </section>
      )}
    </div>
  )
}
