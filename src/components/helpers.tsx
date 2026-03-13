'use client'

import { useEffect } from 'react'
import { RARITIES } from './constants'
import type { Rarity, Color, ToastState } from './types'

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const r = RARITIES.find(x => x.key === rarity)!
  const stars = r.stars > 0 ? '★'.repeat(r.stars) : '♛'
  return (
    <span className={`pill-badge rarity-${rarity}`} style={{ fontSize: 10 }}>
      {stars} {r.label}
    </span>
  )
}

export function ColorDot({ color }: { color: Color }) {
  return <span className={`color-dot color-${color}`} title={color} />
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )
}

export function Toast({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [toast.id, onDone])

  return (
    <div className="toast">
      {toast.type === 'success' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      )}
      <span>{toast.message}</span>
    </div>
  )
}
