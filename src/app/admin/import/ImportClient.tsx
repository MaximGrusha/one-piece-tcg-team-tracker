'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '@/components/AdminLayout'
import { Toast } from '@/components/helpers'
import type { ToastState } from '@/components/types'

type CardSet = {
  id: string; code: string; name: string
  type: 'BOOSTER' | 'STARTER_DECK' | 'PROMO'
  cardCount: number; _count: { cards: number }
}
type ImportResult = { imported: number; skipped: number; updated: number; total: number }

export default function ImportClient() {
  const [sets, setSets] = useState<CardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [defaultQty, setDefaultQty] = useState(0)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [results, setResults] = useState<Record<string, ImportResult>>({})

  const fetchSets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sets')
      if (res.ok) setSets(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSets() }, [fetchSets])

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  async function syncSets() {
    setSyncing(true)
    try {
      const res = await fetch('/api/sets', { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      showToast(`Синхронізовано: ${data.created} нових, ${data.skipped} вже існують`)
      fetchSets()
    } catch { showToast('Помилка синхронізації', 'error') }
    finally { setSyncing(false) }
  }

  async function refreshPrices() {
    setRefreshingPrices(true)
    try {
      const res = await fetch('/api/prices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      showToast(`Ціни оновлено: ${data.updated} карток з ${data.sets} сетів`)
    } catch { showToast('Помилка оновлення цін', 'error') }
    finally { setRefreshingPrices(false) }
  }

  async function importSet(code: string) {
    setImporting(code)
    try {
      const res = await fetch('/api/sets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setCode: code, defaultQuantity: defaultQty }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Помилка') }
      const data: ImportResult = await res.json()
      setResults(prev => ({ ...prev, [code]: data }))
      showToast(`${code}: ${data.imported} імпортовано, ${data.updated} оновлено`)
      fetchSets()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Помилка імпорту', 'error')
    } finally { setImporting(null) }
  }

  const boosters = sets.filter(s => s.type === 'BOOSTER')
  const starters = sets.filter(s => s.type === 'STARTER_DECK')
  const promos   = sets.filter(s => s.type === 'PROMO')

  return (
    <AdminLayout
      title="Імпорт карток"
      subtitle="Синхронізація з OPTCG API"
      actions={
        <a href="/admin/users" className="btn-ghost" style={{ fontSize: 13, textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
          </svg>
          Команда
        </a>
      }
    >
      {/* Controls */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 28,
        flexWrap: 'wrap', alignItems: 'flex-end',
        padding: '18px 20px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 14,
      }}>
        <button className="btn-gold" onClick={syncSets} disabled={syncing}>
          {syncing ? <><span className="spinner" style={{ width: 15, height: 15 }} />Синхронізація...</> : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>Синхронізувати сети</>
          )}
        </button>

        <button className="btn-ghost" onClick={refreshPrices} disabled={refreshingPrices}>
          {refreshingPrices ? <><span className="spinner" style={{ width: 15, height: 15 }} />Оновлення...</> : (
            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>Оновити ціни</>
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginLeft: 'auto' }}>
          <label className="field-label">К-сть за замовч.</label>
          <input
            type="number" min={0} max={99} value={defaultQty}
            onChange={e => setDefaultQty(Number(e.target.value))}
            className="field-input" style={{ width: 88 }}
          />
        </div>
      </div>

      {/* Sets */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : sets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 52, height: 52, marginBottom: 14 }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <p style={{ fontSize: 16, marginBottom: 6 }}>Сети ще не синхронізовані</p>
          <p style={{ fontSize: 14 }}>Натисніть «Синхронізувати сети» щоб завантажити список з API</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {boosters.length > 0 && <SetSection title="Бустер пакети" emoji="📦" sets={boosters} importing={importing} results={results} onImport={importSet} />}
          {starters.length > 0 && <SetSection title="Стартові колоди" emoji="🃏" sets={starters} importing={importing} results={results} onImport={importSet} />}
          {promos.length   > 0 && <SetSection title="Промо" emoji="⭐" sets={promos}   importing={importing} results={results} onImport={importSet} />}
        </div>
      )}

      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
    </AdminLayout>
  )
}

function SetSection({ title, emoji, sets, importing, results, onImport }: {
  title: string; emoji: string; sets: CardSet[]
  importing: string | null; results: Record<string, ImportResult>
  onImport: (code: string) => void
}) {
  return (
    <section>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: 'var(--text-gold)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 9 }}>
        <span>{emoji}</span>
        {title}
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>({sets.length})</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 12 }}>
        {sets.map(s => (
          <SetCard key={s.id} set={s} importing={importing === s.code} result={results[s.code]} onImport={() => onImport(s.code)} />
        ))}
      </div>
    </section>
  )
}

function SetCard({ set, importing, result, onImport }: {
  set: CardSet; importing: boolean; result?: ImportResult; onImport: () => void
}) {
  const hasCards = set._count.cards > 0
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--text-gold)' }}>{set.code}</div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-body)', lineHeight: 1.35 }}>{set.name}</div>
        </div>
        {hasCards && (
          <span style={{
            padding: '3px 9px', whiteSpace: 'nowrap',
            background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 99, fontSize: 11, color: '#34d399', fontFamily: 'var(--font-body)',
          }}>
            {set._count.cards} карт
          </span>
        )}
      </div>

      {result && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
          +{result.imported} нових · {result.updated} оновлено · {result.skipped} без змін
        </div>
      )}

      <button
        className={hasCards ? 'btn-ghost' : 'btn-gold'}
        onClick={onImport}
        disabled={importing}
        style={{ fontSize: 13, alignSelf: 'flex-start' }}
      >
        {importing ? <><span className="spinner" style={{ width: 14, height: 14 }} />Імпорт...</> : hasCards ? 'Оновити' : 'Імпортувати'}
      </button>
    </div>
  )
}
