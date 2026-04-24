'use client'

import { useEffect } from 'react'
import type { Rarity, Color, ToastState } from './types'

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })
}

const RARITY_SHORT: Record<Rarity, string> = {
  COMMON:      'C',
  UNCOMMON:    'UC',
  RARE:        'R',
  SUPER_RARE:  'SR',
  SECRET_RARE: 'SEC',
  LEADER:      'L',
}

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className={`pill-badge rarity-${rarity}`} style={{ fontSize: 9, letterSpacing: '0.06em' }}>
      {RARITY_SHORT[rarity]}
    </span>
  )
}

export function ColorDot({ color }: { color: Color }) {
  return <span className={`color-dot color-${color}`} title={color} />
}

export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <span className="spinner" style={{ width: size, height: size, borderWidth: 2.5 }} />
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
        <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" style={{ width: 16, height: 16, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--crimson)" strokeWidth="2.5" style={{ width: 16, height: 16, flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      )}
      <span style={{ fontSize: 13 }}>{toast.message}</span>
    </div>
  )
}
