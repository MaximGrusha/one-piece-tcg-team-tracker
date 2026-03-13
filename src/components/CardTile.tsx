'use client'

import { useState } from 'react'
import { RarityBadge, ColorDot } from './helpers'
import { COLOR_HEX } from './constants'
import type { Card } from './types'

export function CardTile({
  card,
  onBorrow,
  onEdit,
  onDelete,
  isAdmin,
}: {
  card: Card
  onBorrow: (card: Card) => void
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
  isAdmin: boolean
}) {
  const [imgErr, setImgErr] = useState(false)
  const available = card.availableQuantity
  const total = card.totalQuantity
  const borrowed = total - available
  const pct = total > 0 ? (available / total) * 100 : 100
  const colorHex = COLOR_HEX[card.color]

  return (
    <div className="card-tile card-hover">
      <div className="card-accent" style={{ background: colorHex }} />

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
            style={{ background: `linear-gradient(160deg, ${colorHex}33 0%, var(--bg-surface) 100%)` }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              {card.setCode}
            </span>
          </div>
        )}
      </div>

      <div className="card-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <RarityBadge rarity={card.rarity} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <ColorDot color={card.color} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', letterSpacing: '0.06em' }}>
            {card.setCode}
          </span>
        </div>
        <h3 className="card-name">{card.name}</h3>

        {(card.marketPrice != null || card.inventoryPrice != null) && (
          <div className="card-price-row">
            {card.marketPrice != null && (
              <span className="card-price" title="Market price">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}>
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                {card.marketPrice.toFixed(2)}
              </span>
            )}
            {card.inventoryPrice != null && card.inventoryPrice !== card.marketPrice && (
              <span className="card-price card-price--inv" title="Inventory price">
                ${card.inventoryPrice.toFixed(2)}
              </span>
            )}
          </div>
        )}

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
            {borrowed > 0 && <span style={{ color: 'var(--crimson)', marginLeft: 4 }}>({borrowed} позичено)</span>}
          </span>
        </div>

        {card.notes && (
          <p className="card-notes">{card.notes}</p>
        )}
      </div>

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
        {isAdmin && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
