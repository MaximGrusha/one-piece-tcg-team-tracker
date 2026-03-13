'use client'

import { useState, useEffect, useCallback } from 'react'

type CardSet = {
  id: string
  code: string
  name: string
  type: 'BOOSTER' | 'STARTER_DECK' | 'PROMO'
  cardCount: number
  _count: { cards: number }
}

type ImportResult = {
  imported: number
  skipped: number
  updated: number
  total: number
}

export default function ImportClient() {
  const [sets, setSets] = useState<CardSet[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [defaultQty, setDefaultQty] = useState(0)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [results, setResults] = useState<Record<string, ImportResult>>({})

  const fetchSets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sets')
      if (res.ok) setSets(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSets() }, [fetchSets])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function syncSets() {
    setSyncing(true)
    try {
      const res = await fetch('/api/sets', { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      showToast(`Синхронізовано: ${data.created} нових, ${data.skipped} вже існують`)
      fetchSets()
    } catch {
      showToast('Помилка синхронізації', 'error')
    } finally {
      setSyncing(false)
    }
  }

  async function refreshPrices() {
    setRefreshingPrices(true)
    try {
      const res = await fetch('/api/prices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      showToast(`Ціни оновлено: ${data.updated} карток з ${data.sets} сетів`)
    } catch {
      showToast('Помилка оновлення цін', 'error')
    } finally {
      setRefreshingPrices(false)
    }
  }

  async function importSet(code: string) {
    setImporting(code)
    try {
      const res = await fetch('/api/sets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setCode: code, defaultQuantity: defaultQty }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Помилка')
      }
      const data: ImportResult = await res.json()
      setResults(prev => ({ ...prev, [code]: data }))
      showToast(`${code}: ${data.imported} імпортовано, ${data.updated} оновлено, ${data.skipped} без змін`)
      fetchSets()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Помилка імпорту', 'error')
    } finally {
      setImporting(null)
    }
  }

  const boosters = sets.filter(s => s.type === 'BOOSTER')
  const starters = sets.filter(s => s.type === 'STARTER_DECK')
  const promos = sets.filter(s => s.type === 'PROMO')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <a href="/dashboard" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
              ← Повернутися до колекції
            </a>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-gold)', margin: '4px 0 0' }}>
              Імпорт карток
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0', fontFamily: 'var(--font-body)' }}>
              Синхронізація з OPTCG API (optcgapi.com)
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/admin/users" className="btn-ghost" style={{ fontSize: 12, textDecoration: 'none' }}>
              Команда
            </a>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <button className="btn-gold" onClick={syncSets} disabled={syncing} style={{ fontSize: 13 }}>
            {syncing ? (
              <><span className="spinner" style={{ borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} />Синхронізація...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Синхронізувати сети з API
              </>
            )}
          </button>

          <button className="btn-ghost" onClick={refreshPrices} disabled={refreshingPrices} style={{ fontSize: 13 }}>
            {refreshingPrices ? (
              <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} />Оновлення цін...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                Оновити ціни
              </>
            )}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              К-сть за замовч.
            </label>
            <input
              type="number"
              min={0}
              max={99}
              value={defaultQty}
              onChange={e => setDefaultQty(Number(e.target.value))}
              className="field-input"
              style={{ width: 80, fontSize: 13 }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          </div>
        ) : sets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            <p style={{ fontSize: 15 }}>Сети ще не синхронізовані</p>
            <p style={{ fontSize: 13 }}>Натисніть «Синхронізувати сети з API» щоб завантажити список</p>
          </div>
        ) : (
          <>
            {boosters.length > 0 && (
              <SetSection title="Бустер пакети" sets={boosters} importing={importing} results={results} onImport={importSet} />
            )}
            {starters.length > 0 && (
              <SetSection title="Стартові колоди" sets={starters} importing={importing} results={results} onImport={importSet} />
            )}
            {promos.length > 0 && (
              <SetSection title="Промо" sets={promos} importing={importing} results={results} onImport={importSet} />
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="toast">
          {toast.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  )
}

function SetSection({
  title,
  sets,
  importing,
  results,
  onImport,
}: {
  title: string
  sets: CardSet[]
  importing: string | null
  results: Record<string, ImportResult>
  onImport: (code: string) => void
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-gold)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>({sets.length})</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {sets.map(s => (
          <SetCard key={s.id} set={s} importing={importing === s.code} result={results[s.code]} onImport={() => onImport(s.code)} />
        ))}
      </div>
    </section>
  )
}

function SetCard({
  set,
  importing,
  result,
  onImport,
}: {
  set: CardSet
  importing: boolean
  result?: ImportResult
  onImport: () => void
}) {
  const hasCards = set._count.cards > 0

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-gold)' }}>{set.code}</span>
          <p style={{ fontSize: 12, color: 'var(--text-primary)', margin: '2px 0 0', fontFamily: 'var(--font-body)', lineHeight: 1.3 }}>{set.name}</p>
        </div>
        {hasCards && (
          <span style={{
            padding: '2px 8px',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 999,
            fontSize: 10,
            color: '#15803d',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}>
            {set._count.cards} карток
          </span>
        )}
      </div>

      {result && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          +{result.imported} нових · {result.updated} оновлено · {result.skipped} без змін
        </div>
      )}

      <button
        className={hasCards ? 'btn-ghost' : 'btn-gold'}
        onClick={onImport}
        disabled={importing}
        style={{ fontSize: 11, padding: '6px 12px', alignSelf: 'flex-start' }}
      >
        {importing ? (
          <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: 'var(--bg-base)', borderColor: 'rgba(8,12,24,0.25)' }} />Імпорт...</>
        ) : hasCards ? (
          'Оновити'
        ) : (
          'Імпортувати'
        )}
      </button>
    </div>
  )
}
