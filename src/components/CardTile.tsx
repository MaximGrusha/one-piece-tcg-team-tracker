'use client'

import { useState } from 'react'
import { RarityBadge, ColorDot } from './helpers'
import { COLOR_HEX } from './constants'
import type { Card } from './types'

function cardmarketUrl(name: string) {
  return `https://www.cardmarket.com/en/OnePiece/Products/Search?searchString=${encodeURIComponent(name)}`
}
function tcgplayerUrl(name: string) {
  return `https://www.tcgplayer.com/search/one-piece-card-game/product?q=${encodeURIComponent(name)}`
}

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
  const colorHex = COLOR_HEX[card.color]
  const availClass = available === 0 ? 'avail-empty' : available <= total * 0.3 ? 'avail-warn' : 'avail-good'

  return (
    <div className="card-tile" style={{ '--card-color': colorHex + '55', borderColor: colorHex + '50' } as React.CSSProperties}>
      <div className="card-accent" style={{ background: `linear-gradient(90deg, ${colorHex}, ${colorHex}88)` }} />

      <div className="card-img-wrap">
        {card.imageUrl && !imgErr ? (
          <img src={card.imageUrl} alt={card.name} className="card-img" onError={() => setImgErr(true)} />
        ) : (
          <div className="card-img-placeholder" style={{ background: `linear-gradient(160deg, ${colorHex}28 0%, var(--bg-elevated) 100%)` }}>
            {card.setCode}
          </div>
        )}
        <div className="card-rarity-badge">
          <RarityBadge rarity={card.rarity} />
        </div>
      </div>

      <div className="card-info" style={{ background: `linear-gradient(160deg, ${colorHex}0d 0%, transparent 60%)` }}>
        <div className="card-meta">
          <ColorDot color={card.color} />
          <span className="card-set-code">{card.setCode}</span>
        </div>

        <h3 className="card-name">{card.name}</h3>

        <div className="card-avail-row">
          <span className={`card-avail-text ${availClass}`}>
            {available === 0 ? 'Недоступно' : `${available}/${total} вільно`}
          </span>
          {card.marketPrice != null && card.marketPrice > 0 ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="card-price" title="TCGPlayer USD">${card.marketPrice.toFixed(2)}</span>
              <a
                href={card.cardmarketUrl || cardmarketUrl(card.name)}
                target="_blank" rel="noopener noreferrer"
                className="price-link price-link--cm"
                title="Переглянути на Cardmarket"
                onClick={e => e.stopPropagation()}
              >CM</a>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 4 }}>
              <a
                href={card.cardmarketUrl || cardmarketUrl(card.name)}
                target="_blank" rel="noopener noreferrer"
                className="price-link price-link--cm"
                title="Переглянути на Cardmarket"
                onClick={e => e.stopPropagation()}
              >CM</a>
              <a
                href={tcgplayerUrl(card.name)}
                target="_blank" rel="noopener noreferrer"
                className="price-link price-link--tcp"
                title="Переглянути на TCGPlayer"
                onClick={e => e.stopPropagation()}
              >TCP</a>
            </div>
          )}
        </div>

        {card.notes && <p className="card-notes">{card.notes}</p>}
      </div>

      <div className={`card-actions${isAdmin ? '' : ' no-admin'}`}>
        <button
          className="btn-gold"
          disabled={available === 0}
          onClick={() => onBorrow(card)}
          style={{ fontSize: 12, padding: '7px 10px' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
            <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
          </svg>
          Позичити
        </button>
        {isAdmin && (
          <>
            <button className="btn-icon" onClick={() => onEdit(card)} title="Редагувати">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button className="btn-icon danger" onClick={() => onDelete(card)} title="Видалити">
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
